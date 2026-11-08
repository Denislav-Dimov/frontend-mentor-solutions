'use client';

import { useId, useRef, type ReactNode } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';

type TextFields = {
  action: string;
  additional: string;
  confirm: string;
  cancel: string;
};

type Props = {
  textFields: TextFields;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
  confirmDisabled?: boolean;
  children?: ReactNode;
};

export default function ConfirmDialog({
  textFields,
  onCancel,
  onConfirm,
  pending = false,
  confirmDisabled = false,
  children,
}: Props) {
  const { action, additional, confirm, cancel } = textFields;
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      onClose={() => {
        if (!pending) onCancel();
      }}
      labelledBy={titleId}
      describedBy={descriptionId}
      initialFocusRef={cancelRef}
      role="alertdialog"
    >
      <h2 id={titleId} className="text-grey-800 text-xl font-medium md:text-2xl">
        {action}
      </h2>
      <p id={descriptionId} className="mt-4">
        {additional}
      </p>
      {children && <div className="mt-4 grid gap-3">{children}</div>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={() => {
            if (!pending) onCancel();
          }}
          aria-disabled={pending || undefined}
          className="button-secondary"
        >
          {cancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending || confirmDisabled}
          aria-busy={pending || undefined}
          className="button-danger"
        >
          {pending && <Spinner />}
          {confirm}
        </button>
      </div>
    </Modal>
  );
}
