'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useTransition } from 'react';
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

type ReplyCardProps = {
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

type EditCommentFormProps = {
  content: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (content: string) => void;
};

export default function CommentCard({ comment, currentUser }: CommentCardProps) {
  const router = useRouter();
  const notify = useToast();
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isOwn = comment.user.id === currentUser.id && Boolean(currentUser.id);
  const isSeeded = comment.user.isSeeded;
  const isGuest = !currentUser.id;

  const saveEdit = (content: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateComment(comment.id, content);
        setEditing(false);
        router.refresh();
      } catch (requestError) {
        const message =
          requestError instanceof ApiRequestError && requestError.status === 401
            ? 'Please log in to edit comments.'
            : requestError instanceof Error
              ? requestError.message
              : 'Unable to update the comment.';
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
      const message =
        requestError instanceof ApiRequestError && requestError.status === 401
          ? 'Please log in to reply.'
          : requestError instanceof Error
            ? requestError.message
            : 'Unable to publish your reply.';
      setError(message);
      notify(message);
    }
  };

  const toggleReply = () => setReplyOpen(value => !value);

  return (
    <div>
      <article className="w-full rounded-lg bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <div className="hidden md:block">
            <ScoreControl
              commentId={comment.id}
              score={comment.score}
              vote={comment.vote}
              isGuest={isGuest}
            />
          </div>
          <div className="grid min-w-0 flex-1 gap-4">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                <Image
                  src={comment.user.image.png}
                  alt={comment.user.username}
                  width={34}
                  height={34}
                  unoptimized={comment.user.image.png.startsWith('http')}
                  className="h-8.5 w-8.5 rounded-full"
                />
                <p className="text-grey-800 font-medium">{comment.user.username}</p>
                {isOwn && (
                  <span className="rounded-[5px] bg-purple-600 px-1.75 text-sm text-white">
                    you
                  </span>
                )}
                {isSeeded && (
                  <span className="rounded-[5px] bg-purple-600 px-1.75 text-sm text-white">
                    demo
                  </span>
                )}
                <p className="text-grey-500 shrink-0 font-normal">
                  {timeAgo(comment.createdAt)}
                </p>
              </div>
              <div className="hidden shrink-0 md:block">
                <CommentInteractions
                  comment={comment}
                  isOwn={isOwn}
                  replyOpen={replyOpen}
                  onReply={toggleReply}
                  onEdit={() => setEditing(value => !value)}
                />
              </div>
            </div>
            {editing ? (
              <EditCommentForm
                content={comment.content}
                pending={pending}
                onCancel={() => setEditing(false)}
                onSubmit={saveEdit}
              />
            ) : (
              <p className="text-grey-500 font-normal wrap-break-word">{comment.content}</p>
            )}
            {error && (
              <p className="text-sm text-pink-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between md:hidden">
          <ScoreControl
            commentId={comment.id}
            score={comment.score}
            vote={comment.vote}
            isGuest={isGuest}
          />
          <CommentInteractions
            comment={comment}
            isOwn={isOwn}
            replyOpen={replyOpen}
            onReply={toggleReply}
            onEdit={() => setEditing(value => !value)}
          />
        </div>
      </article>

      {replyOpen && (
        <div className="mt-4">
          <Composer
            avatarSrc={currentUser.image.png}
            avatarAlt={currentUser.username}
            buttonLabel="Reply"
            initialValue={`@${comment.user.username} `}
            isGuest={!currentUser.id}
            autoFocus
            toggleReply={toggleReply}
            onSubmit={submitReply}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-6 flex items-stretch">
          <div aria-hidden="true" className="bg-grey-100 mr-4 w-1 shrink-0 rounded md:mx-10" />
          <div className="grid w-full min-w-0 gap-4 md:gap-6">
            {comment.replies.map(reply => (
              <ReplyCard key={reply.id} comment={reply} currentUser={currentUser} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyCard({ comment, currentUser }: ReplyCardProps) {
  const router = useRouter();
  const notify = useToast();
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isOwn = comment.user.id === currentUser.id && Boolean(currentUser.id);
  const isSeeded = comment.user.isSeeded;
  const isGuest = !currentUser.id;

  const saveEdit = (content: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateComment(comment.id, content);
        setEditing(false);
        router.refresh();
      } catch (requestError) {
        const message =
          requestError instanceof ApiRequestError && requestError.status === 401
            ? 'Please log in to edit comments.'
            : requestError instanceof Error
              ? requestError.message
              : 'Unable to update the comment.';
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
      const message =
        requestError instanceof ApiRequestError && requestError.status === 401
          ? 'Please log in to reply.'
          : requestError instanceof Error
            ? requestError.message
            : 'Unable to publish your reply.';
      setError(message);
      notify(message);
    }
  };

  const toggleReply = () => setReplyOpen(value => !value);

  return (
    <div className="grid min-w-0 gap-4">
      <article className="w-full rounded-lg bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <div className="hidden md:block">
            <ScoreControl
              commentId={comment.id}
              score={comment.score}
              vote={comment.vote}
              isGuest={isGuest}
            />
          </div>
          <div className="grid min-w-0 flex-1 gap-4">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                <Image
                  src={comment.user.image.png}
                  alt={comment.user.username}
                  width={34}
                  height={34}
                  unoptimized={comment.user.image.png.startsWith('http')}
                  className="h-8.5 w-8.5 rounded-full"
                />
                <p className="text-grey-800 font-medium">{comment.user.username}</p>
                {isOwn && (
                  <span className="rounded-[5px] bg-purple-600 px-1.75 text-sm text-white">
                    you
                  </span>
                )}
                {isSeeded && (
                  <span className="rounded-[5px] bg-purple-600 px-1.75 text-sm text-white">
                    demo
                  </span>
                )}
                <p className="text-grey-500 shrink-0 font-normal">
                  {timeAgo(comment.createdAt)}
                </p>
              </div>
              <div className="hidden shrink-0 md:block">
                <CommentInteractions
                  comment={comment}
                  isOwn={isOwn}
                  replyOpen={replyOpen}
                  onReply={toggleReply}
                  onEdit={() => setEditing(value => !value)}
                />
              </div>
            </div>
            {editing ? (
              <EditCommentForm
                content={comment.content}
                pending={pending}
                onCancel={() => setEditing(false)}
                onSubmit={saveEdit}
              />
            ) : (
              <p className="text-grey-500 font-normal wrap-break-word">
                {'replyingTo' in comment && (
                  <span className="font-medium text-purple-600">@{comment.replyingTo} </span>
                )}
                {getDisplayContent(comment)}
              </p>
            )}
            {error && (
              <p className="text-sm text-pink-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between md:hidden">
          <ScoreControl
            commentId={comment.id}
            score={comment.score}
            vote={comment.vote}
            isGuest={isGuest}
          />
          <CommentInteractions
            comment={comment}
            isOwn={isOwn}
            replyOpen={replyOpen}
            onReply={toggleReply}
            onEdit={() => setEditing(value => !value)}
          />
        </div>
      </article>
      {replyOpen && (
        <Composer
          avatarSrc={currentUser.image.png}
          avatarAlt={currentUser.username}
          buttonLabel="Reply"
          initialValue={`@${comment.user.username} `}
          isGuest={!currentUser.id}
          autoFocus
          toggleReply={toggleReply}
          onSubmit={submitReply}
        />
      )}
    </div>
  );
}

function EditCommentForm({ content, pending, onCancel, onSubmit }: EditCommentFormProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(length, length);
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
      className="grid gap-3"
      onSubmit={event => {
        event.preventDefault();
        submitValue();
      }}
    >
      <textarea
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
        className="input min-h-24 w-full resize-y px-5 py-2"
        autoFocus
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
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? 'Saving...' : 'Update'}
        </button>
      </div>
    </form>
  );
}
