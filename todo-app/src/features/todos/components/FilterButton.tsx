type FilterButtonType = {
  text: string;
  active: boolean;
  onClick: () => void;
};

export default function FilterButton({ text, active, onClick }: FilterButtonType) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors cursor-pointer ${
        active
          ? 'text-primary-blue-500'
          : 'hover:text-light-navy-850 dark:hover:text-dark-purple-100'
      }`}
    >
      {text}
    </button>
  );
}
