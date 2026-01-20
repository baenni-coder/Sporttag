const API_BASE = 'http://localhost:3001/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    throw new Error(error.error || 'Anfrage fehlgeschlagen');
  }
  return res.json();
}

// Config
export const getConfig = () => fetchJSON('/config');
export const updateConfig = (data) => fetchJSON('/config', { method: 'PUT', body: JSON.stringify(data) });

// Disciplines
export const getDisciplines = () => fetchJSON('/disciplines');
export const createDiscipline = (data) => fetchJSON('/disciplines', { method: 'POST', body: JSON.stringify(data) });
export const updateDiscipline = (id, data) => fetchJSON(`/disciplines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDiscipline = (id) => fetchJSON(`/disciplines/${id}`, { method: 'DELETE' });

// Groups
export const getGroups = () => fetchJSON('/groups');
export const createGroup = (data) => fetchJSON('/groups', { method: 'POST', body: JSON.stringify(data) });
export const createGroupsBulk = (groups) => fetchJSON('/groups/bulk', { method: 'POST', body: JSON.stringify({ groups }) });
export const deleteGroup = (id) => fetchJSON(`/groups/${id}`, { method: 'DELETE' });

// Results
export const getResults = () => fetchJSON('/results');
export const submitResult = (data) => fetchJSON('/results', { method: 'POST', body: JSON.stringify(data) });
export const deleteResult = (id) => fetchJSON(`/results/${id}`, { method: 'DELETE' });

// Rankings
export const getRankings = () => fetchJSON('/rankings');
