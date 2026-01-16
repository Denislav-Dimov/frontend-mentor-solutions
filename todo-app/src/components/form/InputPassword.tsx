import { useState } from 'react';
import EyeButton from './EyeButton';

type InputPasswordType = {
  label: string;
  password: string;
  setPassword: (password: string) => void;
  passwordError: string;
};

export default function InputPassword({
  label,
  password,
  setPassword,
  passwordError,
}: InputPasswordType) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative group duration-500">
      <input
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        className="peer block w-full rounded-md border border-light-gray-300 dark:border-dark-purple-800 bg-white dark:bg-dark-navy-900 pl-4 pr-12 py-3 text-light-navy-850 dark:text-dark-purple-100 focus:border-primary-blue-500 focus:ring-0 focus:outline-none"
        placeholder=" "
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <label
        htmlFor="password"
        className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white dark:bg-dark-navy-900 px-1.5 text-light-gray-600 dark:text-dark-purple-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
      >
        {label}
      </label>

      <EyeButton
        showPassword={showPassword}
        handleClick={() => setShowPassword(prev => !prev)}
      />

      <p className="mt-1 text-sm text-primary-red">{passwordError}</p>
    </div>
  );
}
