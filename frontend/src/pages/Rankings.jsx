import { useState, useEffect } from 'react';
import * as api from '../api';
import './Rankings.css';

function Rankings() {
  const [data, setData] = useState({ rankings: [], disciplines: [], groups: [] });
  const [config, setConfig] = useState({ event_name: 'Sporttag' });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 5000); // Alle 5 Sekunden aktualisieren

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async () => {
    try {
      const [rankingsData, configData] = await Promise.all([
        api.getRankings(),
        api.getConfig()
      ]);
      setData(rankingsData);
      setConfig(configData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  if (loading) {
    return <div className="loading">Lade Rangliste...</div>;
  }

  return (
    <div className="rankings-page">
      <header className="rankings-header">
        <h1>{config.event_name}</h1>
        {config.event_date && (
          <p className="event-date">
            {new Date(config.event_date).toLocaleDateString('de-CH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
        <div className="refresh-controls">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-Aktualisierung (5s)
          </label>
          <button onClick={loadData} className="btn-refresh">
            Aktualisieren
          </button>
          {lastUpdate && (
            <span className="last-update">
              Letztes Update: {lastUpdate.toLocaleTimeString('de-CH')}
            </span>
          )}
        </div>
      </header>

      {data.rankings.length === 0 ? (
        <div className="no-data">
          <p>Noch keine Resultate vorhanden.</p>
          <p>Trage Resultate ein, um die Rangliste zu sehen.</p>
        </div>
      ) : (
        <>
          {/* Podium für Top 3 */}
          <div className="podium">
            {data.rankings.slice(0, 3).map((item, idx) => (
              <div
                key={item.group.id}
                className={`podium-place place-${item.rank}`}
                style={{ order: item.rank === 1 ? 1 : item.rank === 2 ? 0 : 2 }}
              >
                <div className="podium-medal">{getMedalEmoji(item.rank)}</div>
                <div className="podium-rank">{item.rank}. Platz</div>
                <div className="podium-name">{item.group.name}</div>
                <div className="podium-color">{item.group.color}</div>
                <div className="podium-points">{item.totalPoints} Punkte</div>
              </div>
            ))}
          </div>

          {/* Komplette Rangliste */}
          <table className="rankings-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Gruppe</th>
                <th>Farbe</th>
                {data.disciplines.map(disc => (
                  <th key={disc.id} title={disc.higher_is_better ? 'Höher ist besser' : 'Niedriger ist besser'}>
                    {disc.name}
                    <span className="disc-indicator">
                      {disc.higher_is_better ? '↑' : '↓'}
                    </span>
                  </th>
                ))}
                <th className="total-col">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rankings.map((item) => (
                <tr key={item.group.id} className={item.rank <= 3 ? `rank-${item.rank}` : ''}>
                  <td className="rank-cell">
                    {getMedalEmoji(item.rank)} {item.rank}
                  </td>
                  <td className="name-cell">{item.group.name}</td>
                  <td className="color-cell">
                    <span className={`color-badge color-${item.group.color.toLowerCase()}`}>
                      {item.group.color}
                    </span>
                  </td>
                  {data.disciplines.map(disc => {
                    const result = item.disciplineResults[disc.id];
                    const rankInfo = item.disciplineRanks[disc.id];
                    return (
                      <td key={disc.id} className="result-cell">
                        {result !== undefined ? (
                          <div className="result-value">
                            <span className="value">{result}</span>
                            {rankInfo && (
                              <span className="rank-points" title={`Rang ${rankInfo.rank}`}>
                                (+{rankInfo.points})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="no-result">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="total-cell">{item.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legende */}
          <div className="legend">
            <h3>Legende</h3>
            <p>Die Zahl in Klammern zeigt die Rangpunkte pro Disziplin.</p>
            <p>
              <span className="disc-indicator">↑</span> = Höher ist besser |
              <span className="disc-indicator">↓</span> = Niedriger ist besser
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Rankings;
