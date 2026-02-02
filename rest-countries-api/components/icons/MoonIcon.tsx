import Image from 'next/image';
import moonLightIcon from '@/assets/moon-light.svg';
import moonDarkIcon from '@/assets/moon-dark.svg';

export default function MoonIcon() {
  return (
    <>
      <Image
        src={moonLightIcon}
        alt="Toggle color theme"
        className="dark:hidden block size-4"
      />

      <Image
        src={moonDarkIcon}
        alt="Toggle color theme"
        className="hidden dark:block size-4"
      />
    </>
  );
}
