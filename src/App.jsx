import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, enabled } from './firebase';
import MapPage from './pages/MapPage.jsx';
import About from './pages/About.jsx';

export default function App() {
  const [user, setUser] = useState(enabled ? null : { uid: 'demo' });
  const [authError, setAuthError] = useState('');

  // Every visitor is signed in anonymously so Firestore rules can tell who owns what.
  useEffect(() => {
    if (!enabled) return undefined;
    return onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch((e) => setAuthError(e.message));
    });
  }, []);

  return (
    <HashRouter>
      <nav className="nav">
        <NavLink to="/" className="brand">Ailo</NavLink>
        <NavLink to="/" end>Map</NavLink>
        <NavLink to="/about">About</NavLink>
        <span className="spacer" />
        {!enabled && <span className="badge">Demo mode</span>}
        {authError && <span className="badge">Sign-in failed: {authError}</span>}
      </nav>
      <Routes>
        <Route path="/" element={<MapPage user={user} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}