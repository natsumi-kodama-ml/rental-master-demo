import { Genre } from "@/lib/types";

const GENRE_EMOJI: Record<Genre, string> = {
  邦画: "🎬",
  洋画: "🎞️",
  アニメ: "📺",
  ドラマ: "🎭",
  ゲーム: "🎮",
  音楽: "🎵",
};

export default function TitleImage({
  imageUrl,
  genre,
  alt,
  className = "",
}: {
  imageUrl: string;
  genre: Genre;
  alt: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- package photos are user-uploaded data URLs, not static assets
      <img src={imageUrl} alt={alt} className={`object-cover ${className}`} />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}
      aria-hidden="true"
    >
      <span>{GENRE_EMOJI[genre] ?? "🎬"}</span>
    </div>
  );
}
