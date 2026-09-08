'use client';

import { useState } from 'react';
import type { AnyComment } from '@/features/comments/lib/types';
import { timeAgo } from '@/features/comments/lib/utils';
import ScoreControl from './ScoreControl';

type CommentCardProps = {
  comment: AnyComment;
  isOwn: boolean;
  isReply: boolean;
  isEditing: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onReply: () => void;
  onDelete: () => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: (value: string) => void;
};

function ActionButtons({
  isOwn,
  onReply,
  onDelete,
  onEditStart,
}: Pick<CommentCardProps, 'isOwn' | 'onReply' | 'onDelete' | 'onEditStart'>) {
  if (!isOwn) {
    return (
      <button
        type="button"
        onClick={onReply}
        className="flex cursor-pointer items-center gap-2 border-none bg-transparent font-bold whitespace-nowrap text-purple-600 transition-opacity duration-200 hover:opacity-60"
      >
        <img
          src="/images/icon-reply.svg"
          alt=""
          aria-hidden="true"
          className="translate-y-[1px]"
        />
        Reply
      </button>
    );
  }
  return (
    <div className="flex items-center gap-4 whitespace-nowrap">
      <button
        type="button"
        onClick={onDelete}
        className="flex cursor-pointer items-center gap-2 border-none bg-transparent font-bold text-pink-400 transition-opacity duration-200 hover:opacity-60"
      >
        <img src="/images/icon-delete.svg" alt="" aria-hidden="true" />
        Delete
      </button>
      <button
        type="button"
        onClick={onEditStart}
        className="flex cursor-pointer items-center gap-2 border-none bg-transparent font-bold text-purple-600 transition-opacity duration-200 hover:opacity-60"
      >
        <img src="/images/icon-edit.svg" alt="" aria-hidden="true" />
        Edit
      </button>
    </div>
  );
}

export default function CommentCard(props: CommentCardProps) {
  const { comment, isOwn, isReply, isEditing } = props;
  const [draft, setDraft] = useState(comment.content);
  const replyingTo = 'replyingTo' in comment ? comment.replyingTo : undefined;

  return (
    <article className="w-full rounded-lg bg-white p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="hidden md:block">
          <ScoreControl
            score={comment.score + comment.vote}
            vote={comment.vote}
            onUpvote={props.onUpvote}
            onDownvote={props.onDownvote}
            orientation="vertical"
          />
        </div>

        <div className="grid min-w-0 flex-1 gap-4">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              <img
                src={comment.user.image.png}
                alt={comment.user.username}
                className="h-8.5 w-8.5 rounded-full"
              />
              <p className="text-grey-800 font-medium">{comment.user.username}</p>
              {isOwn && (
                <span className="rounded-[5px] bg-purple-600 px-[7px] py-0 text-sm text-white">
                  you
                </span>
              )}
              <p className="text-grey-500 shrink-0 font-normal">
                {timeAgo(comment.createdAt)}
              </p>
            </div>
            <div className="hidden shrink-0 md:block">
              <ActionButtons
                isOwn={isOwn}
                onReply={props.onReply}
                onDelete={props.onDelete}
                onEditStart={() => {
                  setDraft(comment.content);
                  props.onEditStart();
                }}
              />
            </div>
          </div>

          {isEditing ? (
            <form
              className="grid gap-4"
              onSubmit={event => {
                event.preventDefault();
                const trimmed = draft.trim();
                if (!trimmed) return;
                props.onEditSave(trimmed);
              }}
            >
              <label htmlFor={`edit-${comment.id}`} className="sr-only">
                Edit comment
              </label>
              <textarea
                id={`edit-${comment.id}`}
                value={draft}
                autoFocus
                onChange={event => setDraft(event.target.value)}
                className="border-grey-100 text-grey-800 h-24 w-full resize-none rounded-xl border-2 px-5 py-2 font-normal focus:outline-2 focus:outline-purple-600"
              />
              <button
                type="submit"
                className="w-fit cursor-pointer justify-self-end rounded-[5px] border-none bg-purple-600 px-6 py-2.5 text-sm font-medium text-white uppercase transition-opacity duration-200 hover:opacity-50"
              >
                Update
              </button>
            </form>
          ) : (
            <div className="text-grey-500 font-normal break-words">
              <p>
                {isReply && replyingTo && (
                  <span className="font-medium text-purple-600">@{replyingTo} </span>
                )}
                {comment.content}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between md:hidden">
        <ScoreControl
          score={comment.score + comment.vote}
          vote={comment.vote}
          onUpvote={props.onUpvote}
          onDownvote={props.onDownvote}
        />
        <ActionButtons
          isOwn={isOwn}
          onReply={props.onReply}
          onDelete={props.onDelete}
          onEditStart={() => {
            setDraft(comment.content);
            props.onEditStart();
          }}
        />
      </div>

      {isEditing && (
        <button type="button" onClick={props.onEditCancel} className="sr-only">
          Cancel editing
        </button>
      )}
    </article>
  );
}
