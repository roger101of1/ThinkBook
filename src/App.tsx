import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { learningPath } from './lib/content'
import HomePage from './pages/HomePage'
import SopPage from './pages/SopPage'
import QuizPage from './pages/QuizPage'
import LibraryPage from './pages/LibraryPage'
import TrainerPage from './pages/TrainerPage'

export default function App() {
  const { pathname } = useLocation()
  const narrow = pathname.startsWith('/sop/') || pathname.startsWith('/quiz/')
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="mark">T</span>
          <span className="name">ThinkBook</span>
          <span className="role">{learningPath.role}</span>
        </NavLink>
        <nav>
          <NavLink to="/" end>My training</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/trainer">Trainer</NavLink>
        </nav>
      </header>
      <main className={`main ${narrow ? 'narrow' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sop/:sopId" element={<SopPage />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/trainer" element={<TrainerPage />} />
          <Route path="*" element={<div className="empty">Page not found.</div>} />
        </Routes>
      </main>
    </div>
  )
}
