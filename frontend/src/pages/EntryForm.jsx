import { useState, useEffect } from 'react';
import * as api from '../api';
import './EntryForm.css';

const STORAGE_KEY = 'sporttag_selected_discipline';

function EntryForm() {
  const [disciplines, setDisciplines] = useState([]);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState({ colors: [] });
  const [results, setResults] = useState([]);

  // Schritt-basierter Ablauf
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [disciplineLocked, setDisciplineLocked] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [value, setValue] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    // Gespeicherten Posten aus localStorage laden
    const savedDiscipline = localStorage.getItem(STORAGE_KEY);
    if (savedDiscipline) {
      setSelectedDiscipline(savedDiscipline);
      setDisciplineLocked(true);
    }
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
      setResults(resultsData);
    } catch (err) {
      showMessage('Fehler beim Laden der Daten', 'error');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    if (type === 'success') {
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleDisciplineSelect = (discId) => {
    setSelectedDiscipline(discId);
    localStorage.setItem(STORAGE_KEY, discId);
    setDisciplineLocked(true);
  };

  const handleChangeDiscipline = () => {
    setDisciplineLocked(false);
    setSelectedColor('');
    setSelectedGroup('');
    setValue('');
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedGroup('');
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
  };

  const handleSubmit = async () => {
    if (!selectedDiscipline || !selectedGroup || value === '') {
      showMessage('Bitte alle Felder ausfüllen', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitResult({
        discipline_id: parseInt(selectedDiscipline),
        group_id: parseInt(selectedGroup),
        value: parseFloat(value)
      });

      const group = groups.find(g => g.id === parseInt(selectedGroup));
      showMessage(`Gespeichert: ${group?.name} ${group?.color} = ${value}`);

      // Formular zurücksetzen für nächste Eingabe
      setSelectedColor('');
      setSelectedGroup('');
      setValue('');
      loadData();
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gruppen nach Farbe filtern
  const groupsForColor = groups.filter(g => g.color === selectedColor);

  // Prüfen ob Gruppe bereits ein Resultat für diesen Posten hat
  const hasResult = (groupId) => {
    return results.some(
      r => r.group_id === groupId && r.discipline_id === parseInt(selectedDiscipline)
    );
  };

  // Aktuelle Disziplin-Daten
  const currentDiscipline = disciplines.find(d => d.id === parseInt(selectedDiscipline));

  // Letzte Einträge für diesen Posten
  const recentForDiscipline = results
    .filter(r => r.discipline_id === parseInt(selectedDiscipline))
    .slice(0, 5);

  // Schritt 1: Posten wählen
  if (!disciplineLocked) {
    return (
      <div className="entry-form-page mobile-optimized">
        <h1>Posten wählen</h1>
        <p className="subtitle">Wähle deinen Posten. Diese Auswahl wird gespeichert.</p>

        <div className="discipline-grid">
          {disciplines.map(disc => (
            <button
              key={disc.id}
              className="discipline-card"
              onClick={() => handleDisciplineSelect(String(disc.id))}
            >
              <span className="discipline-name">{disc.name}</span>
              {disc.unit && <span className="discipline-unit">{disc.unit}</span>}
              <span className="discipline-direction">
                {disc.higher_is_better ? '↑ mehr = besser' : '↓ weniger = besser'}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Schritt 2-4: Resultat erfassen
  return (
    <div className="entry-form-page mobile-optimized">
      {/* Header mit aktuellem Posten */}
      <div className="discipline-header">
        <div className="discipline-info">
          <h1>{currentDiscipline?.name}</h1>
          <span className="discipline-meta">
            {currentDiscipline?.unit && `${currentDiscipline.unit} · `}
            {currentDiscipline?.higher_is_better ? '↑ mehr = besser' : '↓ weniger = besser'}
          </span>
        </div>
        <button className="btn-change" onClick={handleChangeDiscipline}>
          Posten wechseln
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Schritt 2: Farbe wählen */}
      <section className="form-section">
        <h2>1. Farbe wählen</h2>
        <div className="color-buttons">
          {config.colors.map(color => (
            <button
              key={color}
              className={`color-btn color-${color.toLowerCase()} ${selectedColor === color ? 'selected' : ''}`}
              onClick={() => handleColorSelect(color)}
            >
              {color}
            </button>
          ))}
        </div>
      </section>

      {/* Schritt 3: Gruppe/Tier wählen */}
      {selectedColor && (
        <section className="form-section">
          <h2>2. Gruppe wählen</h2>
          <div className="group-grid">
            {groupsForColor.map(group => {
              const completed = hasResult(group.id);
              const isSelected = selectedGroup === String(group.id);
              return (
                <button
                  key={group.id}
                  className={`group-card ${completed ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleGroupSelect(String(group.id))}
                  disabled={completed}
                >
                  <span className="group-name">{group.name}</span>
                  {completed && <span className="completed-badge">erledigt</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Schritt 4: Wert eingeben */}
      {selectedGroup && (
        <section className="form-section value-section">
          <h2>3. Wert eingeben</h2>
          <div className="value-input-wrapper">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Wert"
              className="value-input"
              autoFocus
            />
            {currentDiscipline?.unit && (
              <span className="value-unit">{currentDiscipline.unit}</span>
            )}
          </div>

          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!value || isSubmitting}
          >
            {isSubmitting ? 'Speichern...' : 'Speichern'}
          </button>
        </section>
      )}

      {/* Letzte Einträge für diesen Posten */}
      {recentForDiscipline.length > 0 && (
        <section className="recent-section">
          <h3>Letzte Einträge</h3>
          <div className="recent-list">
            {recentForDiscipline.map(entry => (
              <div key={entry.id} className="recent-item">
                <span className="recent-group">{entry.group_name} {entry.group_color}</span>
                <span className="recent-value">{entry.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default EntryForm;
