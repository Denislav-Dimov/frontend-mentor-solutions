'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CommentUser } from '../types';
import { createComment } from '../api/client';
import { ApiRequestError } from '@/features/shared/api/errors';
import { useToast } from '@/features/shared/components/Toast';
import Composer from './Composer';

type CommentComposerProps = {
  currentUser: CommentUser;
};

export default function CommentComposer({ currentUser }: CommentComposerProps) {
  const router = useRouter();
  const notify = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingComments, addOptimisticComment] = useOptimistic<string[], string>(
    [],
    (comments, content) => [...comments, content],
  );

  const submit = (content: string) => {
    setError(null);
    startTransition(async () => {
      addOptimisticComment(content);
      try {
        await createComment(content);
        router.refresh();
      } catch (requestError) {
        const message =
          requestError instanceof ApiRequestError && requestError.status === 401
            ? 'Please log in to publish comments.'
            : requestError instanceof Error
              ? requestError.message
              : 'Unable to publish your comment.';
        setError(message);
        notify(message);
        router.refresh();
      }
    });
  };

  return (
    <div className="grid gap-3">
      {error && (
        <p className="text-grey-800 rounded-lg bg-pink-200 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      )}
      <Composer
        avatarSrc={currentUser.image}
        avatarAlt={currentUser.username}
        buttonLabel="Send"
        isGuest={!currentUser.id}
        onSubmit={submit}
      />
      {pendingComments.map((content, index) => (
        <p
          key={`${content}-${index}`}
          className="text-grey-500 rounded-lg bg-white px-4 py-3 text-sm"
          aria-live="polite"
        >
          Sending comment...
        </p>
      ))}
      {isPending && <span className="sr-only">Sending comment</span>}
    </div>
  );
}
