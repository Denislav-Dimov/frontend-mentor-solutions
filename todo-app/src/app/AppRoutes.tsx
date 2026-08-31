import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../features/auth';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';
import Reauthenticate from '../pages/Reauthenticate';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<Home />} />
        <Route path="/reauthenticate" element={<Reauthenticate />} />
      </Route>

      <Route path="*" element={<Navigate to={'/'} />} />
    </Routes>
  );
}
