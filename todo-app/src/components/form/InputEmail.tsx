type InputEmailType = {
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
};

export default function InputEmail({ email, setEmail, emailError }: InputEmailType) {
  return (
    <div className="relative">
      <input
        type="email"
        id="email"
        autoComplete="email"
        className="peer block w-full rounded-md border border-light-gray-300 dark:border-dark-purple-800 bg-white dark:bg-dark-navy-900 px-4 py-3 text-light-navy-850 dark:text-dark-purple-100 focus:border-primary-blue-500 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder=" "
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label
        htmlFor="email"
        className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white dark:bg-dark-navy-900 px-1.5 text-light-gray-600 dark:text-dark-purple-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
      >
        Email
      </label>

      <p className="mt-1 text-sm text-primary-red">{emailError}</p>
    </div>
  );
}
