'use client';

type DeleteDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteDialog({ onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-heading"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel();
      }}
    >
      <div className="grid w-full max-w-[25rem] gap-4 rounded-lg bg-white p-8">
        <h2 id="delete-heading" className="text-xl font-medium text-grey-800">
          Delete comment
        </h2>
        <p className="font-normal text-grey-500">
          Are you sure you want to delete this comment? This will remove the comment and can&apos;t be
          undone.
        </p>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="w-full cursor-pointer rounded-lg border-none bg-grey-500 p-3 uppercase text-grey-50 transition-opacity duration-200 hover:opacity-50"
          >
            No, cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full cursor-pointer rounded-lg border-none bg-pink-400 p-3 uppercase text-grey-50 transition-opacity duration-200 hover:opacity-50"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}
