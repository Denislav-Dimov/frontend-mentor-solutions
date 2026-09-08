'use client';

type ScoreControlProps = {
  score: number;
  vote: 0 | 1 | -1;
  onUpvote: () => void;
  onDownvote: () => void;
  orientation?: 'auto' | 'vertical';
};

export default function ScoreControl({
  score,
  vote,
  onUpvote,
  onDownvote,
  orientation = 'auto',
}: ScoreControlProps) {
  const layout =
    orientation === 'vertical'
      ? 'flex-col gap-4 px-3 py-3'
      : 'flex-row gap-4 px-4 py-2 md:flex-col md:gap-4 md:px-3 md:py-3';

  return (
    <div
      className={`bg-grey-50 flex h-fit w-fit items-center justify-center rounded-lg font-bold text-purple-600 ${layout}`}
      role="group"
      aria-label={`Score ${score}`}
    >
      <button
        type="button"
        onClick={onUpvote}
        aria-label="Upvote"
        aria-pressed={vote === 1}
        className="group grid cursor-pointer place-items-center border-none bg-transparent p-1 transition-opacity duration-200 hover:opacity-70"
      >
        <svg width="11" height="11" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z"
            fill={vote === 1 ? 'hsl(238, 40%, 52%)' : 'hsl(239, 57%, 85%)'}
            className="transition-colors duration-200 group-hover:fill-purple-600"
          />
        </svg>
      </button>
      <p className="min-w-6 text-center text-base font-medium tabular-nums" aria-live="polite">
        {score}
      </p>
      <button
        type="button"
        onClick={onDownvote}
        aria-label="Downvote"
        aria-pressed={vote === -1}
        className="group grid cursor-pointer place-items-center border-none bg-transparent p-1 transition-opacity duration-200 hover:opacity-70"
      >
        <svg width="11" height="3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z"
            fill={vote === -1 ? 'hsl(238, 40%, 52%)' : 'hsl(239, 57%, 85%)'}
            className="transition-colors duration-200 group-hover:fill-purple-600"
          />
        </svg>
      </button>
    </div>
  );
}
