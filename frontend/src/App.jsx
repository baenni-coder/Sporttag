import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Admin from './pages/Admin';
import EntryForm from './pages/EntryForm';
import Rankings from './pages/Rankings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">Sporttag</div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Rangliste
            </NavLink>
            <NavLink to="/eintragen" className={({ isActive }) => isActive ? 'active' : ''}>
              Resultate eintragen
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
              Admin
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Rankings />} />
            <Route path="/eintragen" element={<EntryForm />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
