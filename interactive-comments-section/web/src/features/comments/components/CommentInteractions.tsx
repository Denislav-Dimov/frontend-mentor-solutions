'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AnyComment } from '../types';
import { deleteComment } from '../api/client';
import { ApiRequestError, useToast, ConfirmDialog } from '@/features/shared';

type Props = {
  comment: AnyComment;
  isOwn: boolean;
  replyOpen?: boolean;
  editing?: boolean;
  onReply?: () => void;
  onEdit: () => void;
};

const actionClass =
  'flex items-center gap-2 rounded-md py-1 font-medium transition-opacity hover:opacity-60';

export default function CommentInteractions({
  comment,
  isOwn,
  replyOpen,
  editing,
  onReply,
  onEdit,
}: Props) {
  const router = useRouter();
  const notify = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteComment(comment.id);
        setShowDelete(false);
        router.refresh();
      } catch (requestError) {
        const message =
          requestError instanceof ApiRequestError && requestError.status === 401
            ? 'Please log in to delete comments.'
            : requestError instanceof Error
              ? requestError.message
              : 'Unable to delete the comment.';
        setError(message);
        notify(message);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 whitespace-nowrap">
        {!isOwn ? (
          <button
            type="button"
            onClick={onReply}
            aria-expanded={replyOpen}
            className={`${actionClass} text-purple-600`}
          >
            <Image src="/images/icon-reply.svg" alt="" width={14} height={13} />
            Reply
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              aria-haspopup="dialog"
              className={`${actionClass} text-pink-400`}
            >
              <Image src="/images/icon-delete.svg" alt="" width={12} height={14} />
              Delete
            </button>
            <button
              type="button"
              onClick={onEdit}
              aria-expanded={editing}
              className={`${actionClass} text-purple-600`}
            >
              <Image src="/images/icon-edit.svg" alt="" width={14} height={14} />
              Edit
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="field-error mt-1 text-xs" role="alert">
          {error}
        </p>
      )}
      {showDelete && (
        <ConfirmDialog
          textFields={{
            action: 'Delete comment',
            additional:
              "Are you sure you want to delete this comment? This will remove the comment and can't be undone.",
            confirm: 'Yes, delete',
            cancel: 'No, cancel',
          }}
          pending={pending}
          onCancel={() => setShowDelete(false)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
