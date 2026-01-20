import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'sporttag.db'));

// Tabellen erstellen
db.exec(`
  -- Disziplinen/Posten
  CREATE TABLE IF NOT EXISTS disciplines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    unit TEXT DEFAULT '',
    higher_is_better INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Gruppen
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, color)
  );

  -- Resultate
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    discipline_id INTEGER NOT NULL,
    value REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
    UNIQUE(group_id, discipline_id)
  );

  -- Event-Konfiguration
  CREATE TABLE IF NOT EXISTS event_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    event_name TEXT DEFAULT 'Sporttag',
    event_date DATE,
    colors TEXT DEFAULT '["Blau", "Grün"]'
  );

  -- Standard-Konfiguration einfügen falls nicht vorhanden
  INSERT OR IGNORE INTO event_config (id, event_name) VALUES (1, 'Sporttag');
`);

export default db;
