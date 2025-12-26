import bgMobileLight from './assets/bg-mobile-light.jpg';
import bgDesktopLight from './assets/bg-desktop-light.jpg';
import bgMobileDark from './assets/bg-mobile-dark.jpg';
import bgDesktopDark from './assets/bg-desktop-dark.jpg';
import AppRoutes from './routes/AppRoutes';
import useTheme from './hooks/useTheme';

export default function App() {
  const { isDark } = useTheme();

  return (
    <main className="min-h-screen grid place-items-center">
      <picture className="fixed -z-10 top-0 left-0 w-full">
        <source srcSet={isDark ? bgDesktopDark : bgDesktopLight} media="(min-width: 768px)" />
        <img src={isDark ? bgMobileDark : bgMobileLight} alt="" className="w-full max-h-[35vh]" />
      </picture>

      <AppRoutes />
    </main>
  );
}
