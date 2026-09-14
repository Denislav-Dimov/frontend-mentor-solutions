'use client';

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
};

export default function ConfirmDialog({ textFields, onCancel, onConfirm }: Props) {
  const { action, additional, confirm, cancel } = textFields;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-heading"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={e => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <div className="grid w-full max-w-100 gap-4 rounded-lg bg-white p-8">
        <h2 id="delete-heading" className="text-grey-800 text-xl font-medium">
          {action}
        </h2>
        <p className="text-grey-500 font-normal">{additional}</p>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="bg-grey-500 text-grey-50 w-full cursor-pointer rounded-lg border-none p-3 uppercase transition-opacity duration-200 hover:opacity-50"
          >
            {cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-grey-50 w-full cursor-pointer rounded-lg border-none bg-pink-400 p-3 uppercase transition-opacity duration-200 hover:opacity-50"
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
