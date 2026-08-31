import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import JobOffer from './pages/JobOffer.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Router>
      <header className="bg-primary-green-400 h-[25vh] bg-[url(../../public/images/bg-header-mobile.svg)] md:bg-[url(../../public/images/bg-header-desktop.svg)] bg-no-repeat bg-cover"></header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/job-offers/:company/:offer" element={<JobOffer />} />
      </Routes>
    </Router>
  );
}
