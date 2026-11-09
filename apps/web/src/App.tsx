import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import StreamPage from './pages/StreamPage';

export default function App() {
  return (
    <div>
      <nav className="container" style={{ paddingBottom: 0 }}>
        <Link to="/">Home</Link>
        {' · '}
        <Link to="/upload">Upload</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/stream/:videoId" element={<StreamPage />} />
      </Routes>
    </div>
  );
}
