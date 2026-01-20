import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import EntryForm from './pages/EntryForm';
import Rankings from './pages/Rankings';
import './App.css';

function Navigation() {
  const location = useLocation();
  const isEntryForm = location.pathname === '/eintragen';

  return (
    <nav className={`navbar ${isEntryForm ? 'navbar-minimal' : ''}`}>
      <div className="nav-brand">Sporttag</div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Rangliste
        </NavLink>
        <NavLink to="/eintragen" className={({ isActive }) => isActive ? 'active' : ''}>
          Erfassen
        </NavLink>
        {!isEntryForm && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
            Admin
          </NavLink>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />

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
