import { NavLink, Route, Routes } from 'react-router-dom'
import { learningPath } from './lib/content'
import HomePage from './pages/HomePage'
import SopPage from './pages/SopPage'
import QuizPage from './pages/QuizPage'
import LibraryPage from './pages/LibraryPage'
import TrainerPage from './pages/TrainerPage'

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          SOP Academy <small>{learningPath.role}</small>
        </NavLink>
        <nav>
          <NavLink to="/" end>My Training</NavLink>
          <NavLink to="/library">SOP Library</NavLink>
          <NavLink to="/trainer">Trainer</NavLink>
        </nav>
      </header>
      <main className="main">
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
