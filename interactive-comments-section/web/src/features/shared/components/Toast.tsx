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
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-60 grid w-[min(22rem,calc(100vw-2rem))] gap-2"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="alert"
            className="toast-enter bg-grey-800 pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-normal text-white shadow-lg"
          >
            <span className="min-w-0 flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded px-1 text-lg leading-none opacity-70 transition-opacity hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
