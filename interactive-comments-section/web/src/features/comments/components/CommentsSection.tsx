'use client';

import { useMemo, useRef, useState } from 'react';
import rawData from '@/features/comments/data/data.json';
import type { CommentUser, Reply, TopLevelComment } from '@/features/comments/lib/types';
import { parseCreatedAt } from '@/features/comments/lib/utils';
import CommentCard from './CommentCard';
import Composer from './Composer';
import DeleteDialog from './DeleteDialog';

type SeedReply = {
  id: number;
  content: string;
  createdAt: string | number;
  score: number;
  replyingTo?: string;
  user: CommentUser;
};

type SeedComment = {
  id: number;
  content: string;
  createdAt: string | number;
  score: number;
  user: CommentUser;
  replies: SeedReply[];
};

function stripMention(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('@')) return trimmed;
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) return '';
  return trimmed.slice(spaceIndex + 1).trim();
}

function seed() {
  const data = rawData as unknown as { currentUser: CommentUser; comments: SeedComment[] };
  return {
    currentUser: data.currentUser,
    comments: data.comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: parseCreatedAt(comment.createdAt),
      score: comment.score,
      user: comment.user,
      vote: 0 as const,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: parseCreatedAt(reply.createdAt),
        score: reply.score,
        replyingTo: reply.replyingTo ?? '',
        user: reply.user,
        vote: 0 as const,
      })),
    })),
  };
}

function findById(comments: TopLevelComment[], id: number): TopLevelComment | Reply | null {
  for (const comment of comments) {
    if (comment.id === id) return comment;
    const reply = comment.replies.find(item => item.id === id);
    if (reply) return reply;
  }
  return null;
}

export default function CommentsSection() {
  const initial = useMemo(() => seed(), []);
  const [currentUser] = useState<CommentUser>(initial.currentUser);
  const [comments, setComments] = useState<TopLevelComment[]>(initial.comments);
  const [activeReplyTo, setActiveReplyTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const nextId = useRef(
    Math.max(0, ...initial.comments.flatMap(c => [c.id, ...c.replies.map(r => r.id)])) + 1,
  );

  const sorted = useMemo(
    () => [...comments].sort((a, b) => b.score + b.vote - (a.score + a.vote)),
    [comments],
  );

  const vote = (id: number, direction: 1 | -1) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === id) {
          return { ...comment, vote: comment.vote === direction ? 0 : direction };
        }
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === id
              ? { ...reply, vote: reply.vote === direction ? 0 : direction }
              : reply,
          ),
        };
      }),
    );
  };

  const addComment = (value: string) => {
    const content = value.trim();
    if (!content) return;
    setComments(prev => [
      ...prev,
      {
        id: nextId.current++,
        content,
        createdAt: Date.now(),
        score: 0,
        user: currentUser,
        replies: [],
        vote: 0,
      },
    ]);
  };

  const addReply = (targetId: number, value: string) => {
    const content = stripMention(value);
    if (!content) return;
    const target = findById(comments, targetId);
    if (!target) return;
    const newReply: Reply = {
      id: nextId.current++,
      content,
      createdAt: Date.now(),
      score: 0,
      replyingTo: target.user.username,
      user: currentUser,
      vote: 0,
    };
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === targetId) {
          return { ...comment, replies: [...comment.replies, newReply] };
        }
        const index = comment.replies.findIndex(reply => reply.id === targetId);
        if (index !== -1) {
          const replies = [...comment.replies];
          replies.splice(index + 1, 0, newReply);
          return { ...comment, replies };
        }
        return comment;
      }),
    );
    setActiveReplyTo(null);
  };

  const saveEdit = (id: number, value: string) => {
    const content = stripMention(value);
    if (!content) return;
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === id) return { ...comment, content };
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === id ? { ...reply, content } : reply,
          ),
        };
      }),
    );
    setEditingId(null);
  };

  const deleteComment = (id: number) => {
    setComments(prev =>
      prev
        .filter(comment => comment.id !== id)
        .map(comment => ({
          ...comment,
          replies: comment.replies.filter(reply => reply.id !== id),
        })),
    );
    setPendingDeleteId(null);
    if (editingId === id) setEditingId(null);
    if (activeReplyTo === id) setActiveReplyTo(null);
  };

  const replyTarget = activeReplyTo !== null ? findById(comments, activeReplyTo) : null;

  return (
    <main className="grid min-h-screen place-items-center">
      <div className="grid w-full max-w-3xl gap-6 p-4 md:p-8">
        <section aria-label="Comments" className="grid gap-6">
          {sorted.map(comment => {
            const isOwnTop = comment.user.username === currentUser.username;
            return (
              <div key={comment.id}>
                <CommentCard
                  comment={comment}
                  isOwn={isOwnTop}
                  isReply={false}
                  isEditing={editingId === comment.id}
                  onUpvote={() => vote(comment.id, 1)}
                  onDownvote={() => vote(comment.id, -1)}
                  onReply={() =>
                    setActiveReplyTo(current => (current === comment.id ? null : comment.id))
                  }
                  onDelete={() => setPendingDeleteId(comment.id)}
                  onEditStart={() => {
                    setEditingId(comment.id);
                    setActiveReplyTo(null);
                  }}
                  onEditCancel={() => setEditingId(null)}
                  onEditSave={value => saveEdit(comment.id, value)}
                />

                {activeReplyTo === comment.id && replyTarget && (
                  <div className="mt-4">
                    <Composer
                      key={`reply-${comment.id}`}
                      avatarSrc={currentUser.image.png}
                      avatarAlt={currentUser.username}
                      buttonLabel="Reply"
                      autoFocus
                      initialValue={`@${replyTarget.user.username} `}
                      onSubmit={value => addReply(comment.id, value)}
                    />
                  </div>
                )}

                {comment.replies.length > 0 && (
                  <div className="mt-6 flex items-stretch">
                    <div
                      aria-hidden="true"
                      className="bg-grey-100 mr-4 w-1 shrink-0 rounded md:mx-10"
                    />
                    <div className="grid w-full min-w-0 gap-4 md:gap-6">
                      {comment.replies.map(reply => (
                        <div key={reply.id}>
                          <CommentCard
                            comment={reply}
                            isOwn={reply.user.username === currentUser.username}
                            isReply
                            isEditing={editingId === reply.id}
                            onUpvote={() => vote(reply.id, 1)}
                            onDownvote={() => vote(reply.id, -1)}
                            onReply={() =>
                              setActiveReplyTo(current =>
                                current === reply.id ? null : reply.id,
                              )
                            }
                            onDelete={() => setPendingDeleteId(reply.id)}
                            onEditStart={() => {
                              setEditingId(reply.id);
                              setActiveReplyTo(null);
                            }}
                            onEditCancel={() => setEditingId(null)}
                            onEditSave={value => saveEdit(reply.id, value)}
                          />
                          {activeReplyTo === reply.id && (
                            <div className="mt-4">
                              <Composer
                                key={`reply-${reply.id}`}
                                avatarSrc={currentUser.image.png}
                                avatarAlt={currentUser.username}
                                buttonLabel="Reply"
                                autoFocus
                                initialValue={`@${reply.user.username} `}
                                onSubmit={value => addReply(reply.id, value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <Composer
          avatarSrc={currentUser.image.png}
          avatarAlt={currentUser.username}
          buttonLabel="Send"
          onSubmit={addComment}
        />

        {pendingDeleteId !== null && (
          <DeleteDialog
            onCancel={() => setPendingDeleteId(null)}
            onConfirm={() => deleteComment(pendingDeleteId)}
          />
        )}
      </div>
    </main>
  );
}
