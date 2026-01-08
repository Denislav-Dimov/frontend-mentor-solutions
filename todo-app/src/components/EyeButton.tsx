import { useTheme } from '../features/theme';

type EyeIconType = {
  showPassword: boolean;
  handleClick: () => void;
};

export default function EyeButton({ showPassword, handleClick }: EyeIconType) {
  const { isDark } = useTheme();
  const color = isDark ? 'hsl(236, 33%, 92%)' : 'currentColor';

  const eyeIcon = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;

  const eyeOffIcon = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute right-4 top-4 md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 cursor-pointer hover:opacity-70 duration-300"
    >
      <img
        src={`data:image/svg+xml,${encodeURIComponent(
          showPassword ? eyeOffIcon() : eyeIcon()
        )}`}
        alt="Toggle password visibility"
        className="size-5"
      />
    </button>
  );
}
