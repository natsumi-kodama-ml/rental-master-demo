import { Category } from "@/lib/types";

const CATEGORY_EMOJI: Record<Category, string> = {
  ゲーム: "🎮",
  "DVD・ブルーレイ": "🎬",
  CD: "🎵",
  コミック: "📖",
};

export default function ProductImage({
  imageUrl,
  category,
  alt,
  className = "",
}: {
  imageUrl: string;
  category: Category;
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
      <span>{CATEGORY_EMOJI[category] ?? "🎬"}</span>
    </div>
  );
}
