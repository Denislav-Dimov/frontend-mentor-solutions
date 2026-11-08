'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AnyComment, CommentUser, TopLevelComment } from '../types';
import { timeAgo } from '../lib/utils';
import { createComment, updateComment } from '../api/client';
import { ApiRequestError } from '@/features/shared/api/errors';
import { useToast } from '@/features/shared/components/Toast';
import CommentInteractions from './CommentInteractions';
import Composer from './Composer';
import ScoreControl from './ScoreControl';

type CommentCardProps = {
  comment: TopLevelComment;
  currentUser: CommentUser;
};

type CommentItemProps = {
  comment: AnyComment;
  currentUser: CommentUser;
};

function getDisplayContent(comment: AnyComment) {
  if ('replyingTo' in comment && typeof comment.replyingTo === 'string') {
    const prefix = `@${comment.replyingTo} `;
    if (comment.content.toLowerCase().startsWith(prefix.toLowerCase())) {
      return comment.content.slice(prefix.length);
    }
  }
  return comment.content;
}

function errorMessage(error: unknown, unauthorized: string, fallback: string) {
  if (error instanceof ApiRequestError && error.status === 401) return unauthorized;
  return error instanceof Error ? error.message : fallback;
}

export default function CommentCard({ comment, currentUser }: CommentCardProps) {
  return (
    <div className="grid gap-4 md:gap-5">
      <CommentItem comment={comment} currentUser={currentUser} />

      {comment.replies.length > 0 && (
        <div className="border-grey-100 grid gap-4 border-l-2 pl-4 md:ml-10 md:gap-5 md:pl-10">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, currentUser }: CommentItemProps) {
  const router = useRouter();
  const notify = useToast();
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isGuest = !currentUser.id;
  const isOwn = !isGuest && comment.user.id === currentUser.id;

  const saveEdit = (content: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateComment(comment.id, content);
        setEditing(false);
        router.refresh();
      } catch (requestError) {
        const message = errorMessage(
          requestError,
          'Please log in to edit comments.',
          'Unable to update the comment.',
        );
        setError(message);
        notify(message);
      }
    });
  };

  const submitReply = async (value: string) => {
    const content = value.trim();
    if (!content) {
      const message = 'Reply cannot be empty.';
      setError(message);
      notify(message);
      return;
    }

    try {
      await createComment(content, comment.id);
      setReplyOpen(false);
      router.refresh();
    } catch (requestError) {
      const message = errorMessage(
        requestError,
        'Please log in to reply.',
        'Unable to publish your reply.',
      );
      setError(message);
      notify(message);
    }
  };

  const toggleReply = () => setReplyOpen(value => !value);
  const toggleEdit = () => setEditing(value => !value);

  const score = (
    <ScoreControl
      commentId={comment.id}
      score={comment.score}
      vote={comment.vote}
      isGuest={isGuest}
    />
  );

  const interactions = (
    <CommentInteractions
      comment={comment}
      isOwn={isOwn}
      replyOpen={replyOpen}
      editing={editing}
      onReply={toggleReply}
      onEdit={toggleEdit}
    />
  );

  return (
    <div className="grid min-w-0 gap-2">
      <article
        aria-label={`Comment by ${comment.user.username}`}
        className="card p-4 md:flex md:items-start md:gap-6 md:p-6"
      >
        <div className="hidden md:block">{score}</div>

        <div className="grid min-w-0 flex-1 gap-4">
          <header className="flex min-w-0 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              <Avatar user={comment.user} />
              <p className="text-grey-800 font-medium">{comment.user.username}</p>
              {isOwn && <Badge>you</Badge>}
              {comment.user.isSeeded && <Badge>demo</Badge>}
              <time
                dateTime={new Date(comment.createdAt).toISOString()}
                suppressHydrationWarning
                className="shrink-0"
              >
                {timeAgo(comment.createdAt)}
              </time>
            </div>
            <div className="hidden shrink-0 md:block">{interactions}</div>
          </header>

          {editing ? (
            <EditCommentForm
              content={comment.content}
              pending={pending}
              onCancel={() => setEditing(false)}
              onSubmit={saveEdit}
            />
          ) : (
            <p className="wrap-break-word">
              {'replyingTo' in comment && (
                <span className="font-medium text-purple-600">@{comment.replyingTo} </span>
              )}
              {getDisplayContent(comment)}
            </p>
          )}

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between md:hidden">
          {score}
          {interactions}
        </div>
      </article>

      {replyOpen && (
        <Composer
          avatarSrc={currentUser.image}
          avatarAlt={currentUser.username}
          buttonLabel="Reply"
          initialValue={`@${comment.user.username} `}
          isGuest={isGuest}
          autoFocus
          toggleReply={toggleReply}
          onSubmit={submitReply}
        />
      )}
    </div>
  );
}

function Avatar({ user }: { user: CommentUser }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="size-8 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="bg-grey-100 text-grey-500 grid size-8 shrink-0 place-items-center rounded-full font-bold"
    >
      {user.username.charAt(0).toUpperCase()}
    </span>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-sm bg-purple-600 px-1.5 pb-0.5 text-sm leading-tight font-medium text-white">
      {children}
    </span>
  );
}

type EditCommentFormProps = {
  content: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (content: string) => void;
};

function EditCommentForm({ content, pending, onCancel, onSubmit }: EditCommentFormProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const length = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(length, length);
    }
  }, []);

  const submitValue = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={event => {
        event.preventDefault();
        submitValue();
      }}
    >
      <label htmlFor={textareaId} className="sr-only">
        Edit comment
      </label>
      <textarea
        id={textareaId}
        name="content"
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitValue();
          }
        }}
        className="input min-h-32 resize-y"
      />
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="button-secondary"
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button-primary min-w-26 uppercase"
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {pending ? 'Saving…' : 'Update'}
        </button>
      </div>
    </form>
  );
}
