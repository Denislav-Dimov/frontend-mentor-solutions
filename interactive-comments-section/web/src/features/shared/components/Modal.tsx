'use client';

import { useEffect, useEffectEvent, useRef, type ReactNode, type RefObject } from 'react';

type Props = {
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  role?: 'dialog' | 'alertdialog';
  children: ReactNode;
};

export default function Modal({
  onClose,
  labelledBy,
  describedBy,
  initialFocusRef,
  role,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const requestClose = useEffectEvent(() => onClose());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!dialog.open) dialog.showModal();
    initialFocusRef?.current?.focus();

    const handleCancel = (event: Event) => {
      event.preventDefault();
      requestClose();
    };
    // Some browsers force-close after repeated prevented Escapes; keep state in sync.
    const handleClose = () => {
      if (!dialog.open) requestClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus();
    };
  }, [initialFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="dialog"
      onPointerDown={event => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={event => {
        if (pointerDownOnBackdrop.current && event.target === event.currentTarget) {
          onClose();
        }
        pointerDownOnBackdrop.current = false;
      }}
    >
      <div className="dialog-panel">{children}</div>
    </dialog>
  );
}
