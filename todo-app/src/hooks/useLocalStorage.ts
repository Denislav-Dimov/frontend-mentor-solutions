export default function useLocalStorage<T>(key: string) {
  const setItem = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(err);
    }
  };

  const getItem = (): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return { setItem, getItem };
}
