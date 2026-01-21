import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection-Namen
const COLLECTIONS = {
  CONFIG: 'config',
  DISCIPLINES: 'disciplines',
  GROUPS: 'groups',
  RESULTS: 'results'
};

// ============ CONFIG ============

export async function getConfig() {
  const docRef = doc(db, COLLECTIONS.CONFIG, 'event');
  const docSnap = await getDoc(docRef);

  const defaultConfig = {
    event_name: 'Sporttag',
    event_date: null,
    colors: ['Blau', 'Grün'],
    admin_password: 'admin123' // Standard-Passwort, sollte geändert werden!
  };

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Fehlende Felder mit Standardwerten ergänzen (für Migration)
    return {
      ...defaultConfig,
      ...data
    };
  }

  // Standard-Konfiguration erstellen falls nicht vorhanden
  await setDoc(docRef, defaultConfig);
  return defaultConfig;
}

export async function updateConfig(data) {
  const docRef = doc(db, COLLECTIONS.CONFIG, 'event');
  const updateData = {
    event_name: data.event_name,
    event_date: data.event_date || null,
    colors: data.colors || []
  };
  // Passwort nur aktualisieren wenn angegeben
  if (data.admin_password) {
    updateData.admin_password = data.admin_password;
  }
  await setDoc(docRef, updateData, { merge: true });
  return { success: true };
}

export async function verifyAdminPassword(password) {
  const config = await getConfig();
  return config.admin_password === password;
}

// ============ DISCIPLINES ============

export async function getDisciplines() {
  const q = query(collection(db, COLLECTIONS.DISCIPLINES), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createDiscipline(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.DISCIPLINES), {
    name: data.name,
    unit: data.unit || '',
    higher_is_better: data.higher_is_better ? true : false,
    created_at: serverTimestamp()
  });
  return { id: docRef.id, ...data };
}

export async function updateDiscipline(id, data) {
  const docRef = doc(db, COLLECTIONS.DISCIPLINES, id);
  await updateDoc(docRef, {
    name: data.name,
    unit: data.unit || '',
    higher_is_better: data.higher_is_better ? true : false
  });
  return { success: true };
}

export async function deleteDiscipline(id) {
  // Auch alle Resultate für diese Disziplin löschen
  const resultsQuery = query(collection(db, COLLECTIONS.RESULTS));
  const resultsSnapshot = await getDocs(resultsQuery);
  const batch = writeBatch(db);

  resultsSnapshot.docs.forEach(resultDoc => {
    if (resultDoc.data().discipline_id === id) {
      batch.delete(resultDoc.ref);
    }
  });

  batch.delete(doc(db, COLLECTIONS.DISCIPLINES, id));
  await batch.commit();
  return { success: true };
}

// ============ GROUPS ============

export async function getGroups() {
  const q = query(collection(db, COLLECTIONS.GROUPS), orderBy('color'), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createGroup(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.GROUPS), {
    name: data.name,
    color: data.color,
    created_at: serverTimestamp()
  });
  return { id: docRef.id, ...data };
}

export async function createGroupsBulk(groups) {
  const batch = writeBatch(db);

  // Existierende Gruppen laden, um Duplikate zu vermeiden
  const existingGroups = await getGroups();
  const existingKeys = new Set(existingGroups.map(g => `${g.name}-${g.color}`));

  groups.forEach(group => {
    const key = `${group.name}-${group.color}`;
    if (!existingKeys.has(key)) {
      const newDocRef = doc(collection(db, COLLECTIONS.GROUPS));
      batch.set(newDocRef, {
        name: group.name,
        color: group.color,
        created_at: serverTimestamp()
      });
      existingKeys.add(key);
    }
  });

  await batch.commit();
  return { success: true };
}

export async function deleteGroup(id) {
  // Auch alle Resultate für diese Gruppe löschen
  const resultsQuery = query(collection(db, COLLECTIONS.RESULTS));
  const resultsSnapshot = await getDocs(resultsQuery);
  const batch = writeBatch(db);

  resultsSnapshot.docs.forEach(resultDoc => {
    if (resultDoc.data().group_id === id) {
      batch.delete(resultDoc.ref);
    }
  });

  batch.delete(doc(db, COLLECTIONS.GROUPS, id));
  await batch.commit();
  return { success: true };
}

// ============ RESULTS ============

export async function getResults() {
  // Alle Daten laden für Joins
  const [resultsSnapshot, disciplinesSnapshot, groupsSnapshot] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.RESULTS), orderBy('created_at', 'desc'))),
    getDocs(collection(db, COLLECTIONS.DISCIPLINES)),
    getDocs(collection(db, COLLECTIONS.GROUPS))
  ]);

  const disciplines = {};
  disciplinesSnapshot.docs.forEach(doc => {
    disciplines[doc.id] = doc.data();
  });

  const groups = {};
  groupsSnapshot.docs.forEach(doc => {
    groups[doc.id] = doc.data();
  });

  return resultsSnapshot.docs.map(doc => {
    const data = doc.data();
    const group = groups[data.group_id] || {};
    const discipline = disciplines[data.discipline_id] || {};
    return {
      id: doc.id,
      group_id: data.group_id,
      discipline_id: data.discipline_id,
      value: data.value,
      created_at: data.created_at?.toDate?.() || new Date(),
      group_name: group.name || 'Unbekannt',
      group_color: group.color || '',
      discipline_name: discipline.name || 'Unbekannt'
    };
  });
}

export async function submitResult(data) {
  // Prüfen ob bereits ein Resultat existiert (Upsert-Logik)
  const resultsSnapshot = await getDocs(collection(db, COLLECTIONS.RESULTS));

  let existingDoc = null;
  resultsSnapshot.docs.forEach(doc => {
    const d = doc.data();
    if (d.group_id === data.group_id && d.discipline_id === data.discipline_id) {
      existingDoc = doc;
    }
  });

  if (existingDoc) {
    // Update
    await updateDoc(existingDoc.ref, {
      value: data.value,
      created_at: serverTimestamp()
    });
    return { success: true, id: existingDoc.id };
  } else {
    // Create
    const docRef = await addDoc(collection(db, COLLECTIONS.RESULTS), {
      group_id: data.group_id,
      discipline_id: data.discipline_id,
      value: data.value,
      created_at: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  }
}

export async function deleteResult(id) {
  await deleteDoc(doc(db, COLLECTIONS.RESULTS, id));
  return { success: true };
}

// ============ RANKINGS ============

export async function getRankings() {
  const [groupsData, disciplinesData, resultsData] = await Promise.all([
    getGroups(),
    getDisciplines(),
    getResults()
  ]);

  // Für jede Disziplin: Rangpunkte berechnen
  const groupPoints = {};
  groupsData.forEach(g => {
    groupPoints[g.id] = {
      group: g,
      totalPoints: 0,
      disciplineResults: {},
      disciplineRanks: {}
    };
  });

  disciplinesData.forEach(discipline => {
    // Alle Resultate für diese Disziplin sammeln
    const discResults = resultsData.filter(r => r.discipline_id === discipline.id);

    if (discResults.length === 0) return;

    // Sortieren nach Wert (je nach higher_is_better)
    discResults.sort((a, b) => {
      if (discipline.higher_is_better) {
        return b.value - a.value;
      } else {
        return a.value - b.value;
      }
    });

    // Rangpunkte vergeben
    const totalGroups = groupsData.length;
    let currentRank = 1;
    let previousValue = null;

    discResults.forEach((result, index) => {
      if (previousValue !== null && result.value === previousValue) {
        // Gleicher Wert = gleicher Rang
      } else {
        currentRank = index + 1;
      }
      previousValue = result.value;

      const points = totalGroups - currentRank + 1;

      if (groupPoints[result.group_id]) {
        groupPoints[result.group_id].totalPoints += points;
        groupPoints[result.group_id].disciplineResults[discipline.id] = result.value;
        groupPoints[result.group_id].disciplineRanks[discipline.id] = { rank: currentRank, points };
      }
    });
  });

  // Nach Gesamtpunkten sortieren
  const rankings = Object.values(groupPoints)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((item, index, arr) => {
      let rank = 1;
      if (index > 0 && arr[index - 1].totalPoints === item.totalPoints) {
        rank = arr[index - 1].rank;
      } else {
        rank = index + 1;
      }
      item.rank = rank;
      return item;
    });

  return {
    rankings,
    disciplines: disciplinesData,
    groups: groupsData
  };
}

// ============ RESET FUNCTIONS ============

export async function resetResults() {
  // Alle Resultate löschen
  const resultsSnapshot = await getDocs(collection(db, COLLECTIONS.RESULTS));
  const batch = writeBatch(db);

  resultsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return { success: true, deleted: resultsSnapshot.docs.length };
}

export async function resetAll() {
  // Alle Resultate, Gruppen und Disziplinen löschen
  const [resultsSnapshot, groupsSnapshot, disciplinesSnapshot] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.RESULTS)),
    getDocs(collection(db, COLLECTIONS.GROUPS)),
    getDocs(collection(db, COLLECTIONS.DISCIPLINES))
  ]);

  const batch = writeBatch(db);

  resultsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  groupsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  disciplinesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  await batch.commit();

  return {
    success: true,
    deleted: {
      results: resultsSnapshot.docs.length,
      groups: groupsSnapshot.docs.length,
      disciplines: disciplinesSnapshot.docs.length
    }
  };
}
