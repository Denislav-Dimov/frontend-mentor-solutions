type ExtensionProps = {
  logo: string;
  name: string;
  description: string;
  isActive: boolean;
  removeExtension: (name: string) => void;
  toggleExtension: (name: string) => void;
};

export default function Extension({ logo, name, description, isActive, removeExtension, toggleExtension }: ExtensionProps) {
  return (
    <div className="animate-fade-in min-h-48 flex flex-col justify-between gap-5 bg-neutral-0 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 shadow-sm p-4 rounded-2xl">
      <div className="flex gap-4">
        <img src={logo} alt={name} className="self-baseline" />
        <div className="space-y-1">
          <h2 className="font-bold text-xl">{name}</h2>
          <p className="text-base text-neutral-600 dark:text-neutral-300">{description}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={() => removeExtension(name)}
          className="btn hover:bg-red-500 hover:border-red-500 hover:text-neutral-0 dark:hover:text-neutral-900 focus-visible:bg-neutral-100 dark:focus-visible:bg-neutral-800 font-semibold"
        >
          Remove
        </button>
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isActive} onChange={() => toggleExtension(name)} />
          <div className="relative p-1 w-9 h-5 bg-neutral-300 dark:bg-neutral-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-neutral-0 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-700 dark:peer-checked:bg-red-400 hover:peer-checked:bg-red-700 dark:hover:peer-checked:bg-red-400 duration-200 outline-2 outline-transparent peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red-400"></div>
        </label>
      </div>
    </div>
  );
}
