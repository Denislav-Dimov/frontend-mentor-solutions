'use client';

import { useEffect, useId, useOptimistic, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { voteComment } from '../api/client';
import { ApiRequestError } from '@/features/shared/api/errors';
import { GuestDialog } from '@/features/shared/components/GuestPrompt';
import { useToast } from '@/features/shared/components/Toast';

type ScoreControlProps = {
  commentId?: string;
  score: number;
  vote: 0 | 1 | -1;
  onUpvote?: () => void;
  onDownvote?: () => void;
  orientation?: 'auto' | 'vertical';
  isGuest?: boolean;
};

type Reaction = {
  user: {
    username: string;
    avatarUrl: string;
  };
  value: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5217';

export default function ScoreControl({
  commentId,
  score,
  vote,
  orientation = 'auto',
  isGuest = false,
}: ScoreControlProps) {
  const router = useRouter();
  const notify = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { score, vote },
    (current, next: { score: number; vote: 0 | 1 | -1 }) => next,
  );
  const [showAuth, setShowAuth] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loadingReactions, setLoadingReactions] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, []);

  const loadReactions = async () => {
    if (!commentId || loadingReactions || hasLoaded) {
      return;
    }

    setLoadingReactions(true);
    try {
      const response = await fetch(`${apiUrl}/api/comments/${commentId}/votes`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Unable to load reactions.');
      }
      const page = (await response.json()) as { items: Reaction[] };
      setReactions(page.items);
      setHasLoaded(true);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to load reactions.');
    } finally {
      setLoadingReactions(false);
    }
  };

  const castVote = (value: 1 | -1) => {
    if (isGuest) {
      setShowAuth(true);
      return;
    }
    const nextVote = optimisticState.vote === value ? 0 : value;
    startTransition(async () => {
      setOptimisticState({
        vote: nextVote,
        score: optimisticState.score + (nextVote - optimisticState.vote),
      });
      try {
        await voteComment(commentId ?? '', value);
        router.refresh();
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          setShowAuth(true);
          router.refresh();
          return;
        }
        notify(error instanceof Error ? error.message : 'Unable to save your vote.');
        router.refresh();
      }
    });
  };

  const layout =
    orientation === 'vertical'
      ? 'flex-col gap-4 px-3 py-3'
      : 'flex-row gap-4 px-4 py-2 md:flex-col md:gap-4 md:px-3 md:py-3';

  return (
    <div
      className="group/score relative grid w-fit justify-items-center gap-1.5"
      onMouseEnter={loadReactions}
      onFocus={loadReactions}
      onKeyDown={event => {
        if (event.key === 'Escape') setMobileOpen(false);
      }}
    >
      <div
        className={`bg-grey-50 flex h-fit w-fit items-center justify-center rounded-lg font-bold text-purple-600 ${layout}`}
        role="group"
        aria-label={`Score ${optimisticState.score}`}
        aria-describedby={commentId ? tooltipId : undefined}
      >
        <button
          type="button"
          disabled={isPending}
          onClick={() => castVote(1)}
          aria-label="Upvote"
          aria-pressed={optimisticState.vote === 1}
          className="group grid place-items-center border-none bg-transparent p-1 transition-opacity duration-200 hover:opacity-70"
        >
          <svg width="11" height="11" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z"
              fill={optimisticState.vote === 1 ? 'hsl(238, 40%, 52%)' : 'hsl(239, 57%, 85%)'}
              className="transition-colors duration-200 group-hover:fill-purple-600"
            />
          </svg>
        </button>
        <p
          className="min-w-6 text-center text-base font-medium tabular-nums"
          aria-live="polite"
        >
          {optimisticState.score}
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => castVote(-1)}
          aria-label="Downvote"
          aria-pressed={optimisticState.vote === -1}
          className="group grid place-items-center border-none bg-transparent p-1 transition-opacity duration-200 hover:opacity-70"
        >
          <svg width="11" height="3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z"
              fill={optimisticState.vote === -1 ? 'hsl(238, 40%, 52%)' : 'hsl(239, 57%, 85%)'}
              className="transition-colors duration-200 group-hover:fill-purple-600"
            />
          </svg>
        </button>
      </div>
      {commentId && (
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={tooltipId}
          onClick={() => {
            if (!mobileOpen) void loadReactions();
            setMobileOpen(value => !value);
          }}
          className="text-xs font-bold text-purple-600 underline-offset-2 hover:underline md:hidden"
        >
          {mobileOpen ? 'Hide interactions' : 'View interactions'}
        </button>
      )}
      {commentId && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`border-grey-100 text-grey-800 invisible absolute top-[calc(100%+0.5rem)] left-0 z-30 max-h-64 w-56 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border bg-white p-3 text-left text-sm font-normal opacity-0 shadow-sm transition-opacity duration-200 md:left-1/2 md:-translate-x-1/2 md:group-focus-within/score:visible md:group-focus-within/score:opacity-100 md:group-hover/score:visible md:group-hover/score:opacity-100 ${mobileOpen ? 'max-md:visible max-md:opacity-100' : ''}`}
        >
          <p className="mb-2 font-bold">Reactions</p>
          {loadingReactions ? (
            <p className="text-grey-500">Loading...</p>
          ) : reactions.length === 0 ? (
            <p className="text-grey-500">No reactions yet.</p>
          ) : (
            <ul className="grid">
              {reactions.map(reaction => (
                <li
                  key={`${reaction.user.username}-${reaction.value}`}
                  className="flex items-center gap-2 py-1"
                >
                  <Image
                    src={reaction.user.avatarUrl}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized={Boolean(reaction.user.avatarUrl)}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="min-w-0 flex-1 truncate">{reaction.user.username}</span>
                  <span
                    className="font-bold text-purple-600"
                    aria-label={reaction.value === 1 ? 'upvote' : 'downvote'}
                  >
                    {reaction.value === 1 ? '+' : '−'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <GuestDialog
        action="vote on comments"
        open={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
}
