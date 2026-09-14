import { CommentsList, type CommentUser } from '@/features/comments';
import { StatusBar } from '@/features/shared';
import { getComments, getCurrentUser } from '@/features/shared/api/server';

function avatar(url?: string | null) {
  const source = url ?? '/images/avatars/image-default.png';
  return { png: source, webp: source };
}

export default async function HomePage() {
  const [comments, user] = await Promise.all([getComments(), getCurrentUser()]);
  const currentUser: CommentUser = user
    ? {
        id: user.id,
        username: user.username,
        image: avatar(user.avatarUrl),
        isSeeded: user.isSeeded ?? false,
      }
    : { username: 'guest', image: avatar(), isSeeded: false };
  return (
    <>
      <StatusBar user={user} />
      <CommentsList currentUser={currentUser} comments={comments} />
    </>
  );
}
