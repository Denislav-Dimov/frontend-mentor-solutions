'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Toast = { id: number; message: string };

const ToastContext = createContext<{ notify: (message: string) => void } | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context.notify;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string) => {
      const id = ++idRef.current;
      setToasts(current => [...current.slice(-2), { id, message }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-60 grid justify-items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-88"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-enter bg-grey-800 pointer-events-auto flex w-full items-start gap-3 rounded-lg py-3 pr-2 pl-4 text-sm text-white shadow-[0_8px_24px_rgb(0_0_0/0.15)]"
          >
            <p className="min-w-0 flex-1 py-0.5">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="grid size-7 shrink-0 place-items-center rounded-md text-lg leading-none text-white/70 transition-colors hover:text-white"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
