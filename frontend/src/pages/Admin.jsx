import { useState, useEffect } from 'react';
import * as api from '../api';
import './Admin.css';

function Admin() {
  const [config, setConfig] = useState({ event_name: '', event_date: '', colors: [] });
  const [disciplines, setDisciplines] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newDiscipline, setNewDiscipline] = useState({ name: '', unit: '', higher_is_better: true });
  const [newGroup, setNewGroup] = useState({ name: '', color: '' });
  const [bulkGroups, setBulkGroups] = useState('');
  const [newColor, setNewColor] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configData, disciplinesData, groupsData] = await Promise.all([
        api.getConfig(),
        api.getDisciplines(),
        api.getGroups()
      ]);
      setConfig(configData);
      setDisciplines(disciplinesData);
      setGroups(groupsData);
    } catch (err) {
      showMessage('Fehler beim Laden der Daten', 'error');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleConfigSave = async () => {
    try {
      await api.updateConfig(config);
      showMessage('Konfiguration gespeichert');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleAddColor = () => {
    if (newColor && !config.colors.includes(newColor)) {
      setConfig({ ...config, colors: [...config.colors, newColor] });
      setNewColor('');
    }
  };

  const handleRemoveColor = (color) => {
    setConfig({ ...config, colors: config.colors.filter(c => c !== color) });
  };

  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    try {
      await api.createDiscipline(newDiscipline);
      setNewDiscipline({ name: '', unit: '', higher_is_better: true });
      loadData();
      showMessage('Disziplin hinzugefügt');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleUpdateDiscipline = async (disc) => {
    try {
      await api.updateDiscipline(disc.id, disc);
      showMessage('Disziplin aktualisiert');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleDeleteDiscipline = async (id) => {
    if (!confirm('Disziplin wirklich löschen? Alle zugehörigen Resultate werden ebenfalls gelöscht.')) return;
    try {
      await api.deleteDiscipline(id);
      loadData();
      showMessage('Disziplin gelöscht');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await api.createGroup(newGroup);
      setNewGroup({ name: '', color: config.colors[0] || '' });
      loadData();
      showMessage('Gruppe hinzugefügt');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleBulkAddGroups = async () => {
    const names = bulkGroups.split('\n').map(n => n.trim()).filter(n => n);
    if (names.length === 0) return;

    const groupsToAdd = [];
    config.colors.forEach(color => {
      names.forEach(name => {
        groupsToAdd.push({ name, color });
      });
    });

    try {
      await api.createGroupsBulk(groupsToAdd);
      setBulkGroups('');
      loadData();
      showMessage(`${groupsToAdd.length} Gruppen hinzugefügt`);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Gruppe wirklich löschen?')) return;
    try {
      await api.deleteGroup(id);
      loadData();
      showMessage('Gruppe gelöscht');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin-Bereich</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Event-Konfiguration */}
      <section className="admin-section">
        <h2>Event-Konfiguration</h2>
        <div className="form-row">
          <label>
            Event-Name:
            <input
              type="text"
              value={config.event_name}
              onChange={(e) => setConfig({ ...config, event_name: e.target.value })}
            />
          </label>
          <label>
            Datum:
            <input
              type="date"
              value={config.event_date || ''}
              onChange={(e) => setConfig({ ...config, event_date: e.target.value })}
            />
          </label>
        </div>

        <div className="colors-section">
          <h3>Teamfarben</h3>
          <div className="color-tags">
            {config.colors.map(color => (
              <span key={color} className="color-tag">
                {color}
                <button onClick={() => handleRemoveColor(color)}>&times;</button>
              </span>
            ))}
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Neue Farbe"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            />
            <button onClick={handleAddColor}>Hinzufügen</button>
          </div>
        </div>

        <button className="btn-primary" onClick={handleConfigSave}>Konfiguration speichern</button>
      </section>

      {/* Disziplinen */}
      <section className="admin-section">
        <h2>Disziplinen / Posten</h2>

        <form onSubmit={handleAddDiscipline} className="add-form">
          <input
            type="text"
            placeholder="Name der Disziplin"
            value={newDiscipline.name}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Einheit (z.B. Punkte, Sekunden)"
            value={newDiscipline.unit}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, unit: e.target.value })}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newDiscipline.higher_is_better}
              onChange={(e) => setNewDiscipline({ ...newDiscipline, higher_is_better: e.target.checked })}
            />
            Höher ist besser
          </label>
          <button type="submit">Hinzufügen</button>
        </form>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Einheit</th>
              <th>Bewertung</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {disciplines.map(disc => (
              <tr key={disc.id}>
                <td>
                  <input
                    type="text"
                    value={disc.name}
                    onChange={(e) => {
                      const updated = disciplines.map(d =>
                        d.id === disc.id ? { ...d, name: e.target.value } : d
                      );
                      setDisciplines(updated);
                    }}
                    onBlur={() => handleUpdateDiscipline(disc)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={disc.unit || ''}
                    onChange={(e) => {
                      const updated = disciplines.map(d =>
                        d.id === disc.id ? { ...d, unit: e.target.value } : d
                      );
                      setDisciplines(updated);
                    }}
                    onBlur={() => handleUpdateDiscipline(disc)}
                  />
                </td>
                <td>
                  <select
                    value={disc.higher_is_better ? '1' : '0'}
                    onChange={(e) => {
                      const updated = { ...disc, higher_is_better: e.target.value === '1' };
                      const updatedList = disciplines.map(d =>
                        d.id === disc.id ? updated : d
                      );
                      setDisciplines(updatedList);
                      handleUpdateDiscipline(updated);
                    }}
                  >
                    <option value="1">Höher ist besser</option>
                    <option value="0">Niedriger ist besser</option>
                  </select>
                </td>
                <td>
                  <button className="btn-danger" onClick={() => handleDeleteDiscipline(disc.id)}>
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gruppen */}
      <section className="admin-section">
        <h2>Gruppen</h2>

        <div className="groups-forms">
          <div className="single-add">
            <h3>Einzelne Gruppe hinzufügen</h3>
            <form onSubmit={handleAddGroup} className="add-form">
              <input
                type="text"
                placeholder="Gruppenname (z.B. Löwe)"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
              <select
                value={newGroup.color}
                onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                required
              >
                <option value="">Farbe wählen</option>
                {config.colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <button type="submit">Hinzufügen</button>
            </form>
          </div>

          <div className="bulk-add">
            <h3>Mehrere Gruppen (Tiernamen)</h3>
            <p className="hint">Ein Name pro Zeile. Wird automatisch für jede Farbe erstellt.</p>
            <textarea
              placeholder="Löwe&#10;Tiger&#10;Elefant&#10;..."
              value={bulkGroups}
              onChange={(e) => setBulkGroups(e.target.value)}
              rows={6}
            />
            <button onClick={handleBulkAddGroups}>Gruppen erstellen</button>
          </div>
        </div>

        <div className="groups-list">
          {config.colors.map(color => (
            <div key={color} className="color-group">
              <h3>{color}</h3>
              <div className="group-tags">
                {groups.filter(g => g.color === color).map(group => (
                  <span key={group.id} className="group-tag">
                    {group.name}
                    <button onClick={() => handleDeleteGroup(group.id)}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Admin;
