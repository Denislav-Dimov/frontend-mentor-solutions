import { createContext } from 'react';
import { type User } from 'firebase/auth';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
