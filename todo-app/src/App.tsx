import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import bgMobileLight from './assets/bg-mobile-light.jpg';
import bgDesktopLight from './assets/bg-desktop-light.jpg';
import bgMobileDark from './assets/bg-mobile-dark.jpg';
import bgDesktopDark from './assets/bg-desktop-dark.jpg';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <main className="min-h-screen grid place-items-center">
        <picture className="fixed -z-10 top-0 left-0 w-full">
          <source srcSet={bgDesktopLight} media="(min-width: 768px)" />
          <img src={bgMobileLight} alt="" className="w-full max-h-[35vh]" />
        </picture>

        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </Router>
      </main>
    </AuthProvider>
  );
}
