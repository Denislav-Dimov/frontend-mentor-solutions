import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../features/auth';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to={'/'} replace />} />
    </Routes>
  );
}
