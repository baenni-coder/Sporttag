import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============ EVENT CONFIG ============

app.get('/api/config', (req, res) => {
  const config = db.prepare('SELECT * FROM event_config WHERE id = 1').get();
  config.colors = JSON.parse(config.colors || '[]');
  res.json(config);
});

app.put('/api/config', (req, res) => {
  const { event_name, event_date, colors } = req.body;
  db.prepare(`
    UPDATE event_config
    SET event_name = ?, event_date = ?, colors = ?
    WHERE id = 1
  `).run(event_name, event_date, JSON.stringify(colors || []));
  res.json({ success: true });
});

// ============ DISCIPLINES ============

app.get('/api/disciplines', (req, res) => {
  const disciplines = db.prepare('SELECT * FROM disciplines ORDER BY name').all();
  res.json(disciplines);
});

app.post('/api/disciplines', (req, res) => {
  const { name, unit, higher_is_better } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO disciplines (name, unit, higher_is_better) VALUES (?, ?, ?)'
    ).run(name, unit || '', higher_is_better ? 1 : 0);
    res.json({ id: result.lastInsertRowid, name, unit, higher_is_better });
  } catch (err) {
    res.status(400).json({ error: 'Disziplin existiert bereits' });
  }
});

app.put('/api/disciplines/:id', (req, res) => {
  const { name, unit, higher_is_better } = req.body;
  db.prepare(
    'UPDATE disciplines SET name = ?, unit = ?, higher_is_better = ? WHERE id = ?'
  ).run(name, unit || '', higher_is_better ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/disciplines/:id', (req, res) => {
  db.prepare('DELETE FROM disciplines WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ GROUPS ============

app.get('/api/groups', (req, res) => {
  const groups = db.prepare('SELECT * FROM groups ORDER BY color, name').all();
  res.json(groups);
});

app.post('/api/groups', (req, res) => {
  const { name, color } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO groups (name, color) VALUES (?, ?)'
    ).run(name, color);
    res.json({ id: result.lastInsertRowid, name, color });
  } catch (err) {
    res.status(400).json({ error: 'Gruppe existiert bereits' });
  }
});

app.post('/api/groups/bulk', (req, res) => {
  const { groups } = req.body;
  const insert = db.prepare('INSERT OR IGNORE INTO groups (name, color) VALUES (?, ?)');
  const insertMany = db.transaction((groups) => {
    for (const g of groups) {
      insert.run(g.name, g.color);
    }
  });
  insertMany(groups);
  res.json({ success: true });
});

app.delete('/api/groups/:id', (req, res) => {
  db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ RESULTS ============

app.get('/api/results', (req, res) => {
  const results = db.prepare(`
    SELECT r.*, g.name as group_name, g.color as group_color, d.name as discipline_name
    FROM results r
    JOIN groups g ON r.group_id = g.id
    JOIN disciplines d ON r.discipline_id = d.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(results);
});

app.post('/api/results', (req, res) => {
  const { group_id, discipline_id, value } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO results (group_id, discipline_id, value)
      VALUES (?, ?, ?)
      ON CONFLICT(group_id, discipline_id)
      DO UPDATE SET value = excluded.value, created_at = CURRENT_TIMESTAMP
    `).run(group_id, discipline_id, value);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/results/:id', (req, res) => {
  db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ RANKINGS ============

app.get('/api/rankings', (req, res) => {
  // Alle Gruppen holen
  const groups = db.prepare('SELECT * FROM groups ORDER BY color, name').all();

  // Alle Disziplinen holen
  const disciplines = db.prepare('SELECT * FROM disciplines').all();

  // Alle Resultate holen
  const results = db.prepare(`
    SELECT r.group_id, r.discipline_id, r.value, d.higher_is_better
    FROM results r
    JOIN disciplines d ON r.discipline_id = d.id
  `).all();

  // Für jede Disziplin: Rangpunkte berechnen
  const groupPoints = {};
  groups.forEach(g => {
    groupPoints[g.id] = {
      group: g,
      totalPoints: 0,
      disciplineResults: {},
      disciplineRanks: {}
    };
  });

  disciplines.forEach(discipline => {
    // Alle Resultate für diese Disziplin sammeln
    const discResults = results.filter(r => r.discipline_id === discipline.id);

    if (discResults.length === 0) return;

    // Sortieren nach Wert (je nach higher_is_better)
    discResults.sort((a, b) => {
      if (discipline.higher_is_better) {
        return b.value - a.value; // Höher ist besser: absteigend
      } else {
        return a.value - b.value; // Niedriger ist besser: aufsteigend
      }
    });

    // Rangpunkte vergeben (1. Platz = Anzahl Gruppen, 2. Platz = Anzahl-1, etc.)
    const totalGroups = groups.length;
    let currentRank = 1;
    let previousValue = null;
    let skipCount = 0;

    discResults.forEach((result, index) => {
      // Bei gleichem Wert: gleicher Rang
      if (previousValue !== null && result.value === previousValue) {
        skipCount++;
      } else {
        currentRank = index + 1;
        skipCount = 0;
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
      // Rang berechnen (bei gleicher Punktzahl gleicher Rang)
      let rank = 1;
      for (let i = 0; i < index; i++) {
        if (arr[i].totalPoints > item.totalPoints) {
          rank = i + 2;
        }
      }
      if (index > 0 && arr[index - 1].totalPoints === item.totalPoints) {
        rank = arr[index - 1].rank;
      }
      item.rank = rank;
      return item;
    });

  res.json({
    rankings,
    disciplines,
    groups
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`Sporttag-Backend läuft auf http://localhost:${PORT}`);
});
