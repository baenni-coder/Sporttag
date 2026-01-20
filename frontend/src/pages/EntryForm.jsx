import { useState, useEffect } from 'react';
import * as api from '../api';
import './EntryForm.css';

function EntryForm() {
  const [disciplines, setDisciplines] = useState([]);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState({ colors: [] });
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [disciplinesData, groupsData, configData, resultsData] = await Promise.all([
        api.getDisciplines(),
        api.getGroups(),
        api.getConfig(),
        api.getResults()
      ]);
      setDisciplines(disciplinesData);
      setGroups(groupsData);
      setConfig(configData);
      setRecentEntries(resultsData.slice(0, 10));
    } catch (err) {
      showMessage('Fehler beim Laden der Daten', 'error');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDiscipline || !selectedGroup || value === '') {
      showMessage('Bitte alle Felder ausfüllen', 'error');
      return;
    }

    try {
      await api.submitResult({
        discipline_id: parseInt(selectedDiscipline),
        group_id: parseInt(selectedGroup),
        value: parseFloat(value)
      });

      showMessage('Resultat gespeichert!');
      setValue('');
      loadData();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const groupsByColor = config.colors.reduce((acc, color) => {
    acc[color] = groups.filter(g => g.color === color);
    return acc;
  }, {});

  const selectedDisciplineData = disciplines.find(d => d.id === parseInt(selectedDiscipline));

  return (
    <div className="entry-form-page">
      <h1>Resultat eintragen</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label>Posten / Disziplin</label>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            required
          >
            <option value="">-- Posten wählen --</option>
            {disciplines.map(disc => (
              <option key={disc.id} value={disc.id}>
                {disc.name} {disc.unit && `(${disc.unit})`}
              </option>
            ))}
          </select>
          {selectedDisciplineData && (
            <span className="hint">
              {selectedDisciplineData.higher_is_better
                ? '↑ Höher ist besser'
                : '↓ Niedriger ist besser'}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Gruppe</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            required
          >
            <option value="">-- Gruppe wählen --</option>
            {config.colors.map(color => (
              <optgroup key={color} label={color}>
                {groupsByColor[color]?.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} {color}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Wert</label>
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="z.B. 15 oder 23.5"
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-large">
          Resultat speichern
        </button>
      </form>

      <section className="recent-entries">
        <h2>Letzte Einträge</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Gruppe</th>
              <th>Posten</th>
              <th>Wert</th>
              <th>Zeit</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.group_name} {entry.group_color}</td>
                <td>{entry.discipline_name}</td>
                <td>{entry.value}</td>
                <td>{new Date(entry.created_at).toLocaleTimeString('de-CH')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default EntryForm;
