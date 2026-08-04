export const GENRES = [
  "邦画",
  "洋画",
  "アニメ",
  "ドラマ",
  "ゲーム",
  "音楽",
] as const;

export type Genre = (typeof GENRES)[number];

export const MEDIA_TYPES = ["DVD", "Blu-ray", "ゲームソフト", "CD"] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export const RELEASE_STATUSES = ["新作", "準新作", "旧作"] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export interface Title {
  id: string;
  name: string;
  genre: Genre;
  mediaType: MediaType;
  releaseDate: string;
  statusOverride: ReleaseStatus | null;
  rentalPrice: number;
  totalCopies: number;
  rentedCopies: number;
  available: boolean;
  imageUrl: string;
  synopsis: string;
  cast: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type TitleInput = Omit<Title, "id" | "createdAt" | "updatedAt">;

const NEW_RELEASE_WEEKS = 8;
const SEMI_NEW_WEEKS = 20;

export function computeReleaseStatus(
  releaseDate: string,
  statusOverride: ReleaseStatus | null
): ReleaseStatus {
  if (statusOverride) return statusOverride;
  const weeksElapsed =
    (Date.now() - new Date(releaseDate).getTime()) / (7 * 24 * 60 * 60 * 1000);
  if (weeksElapsed < NEW_RELEASE_WEEKS) return "新作";
  if (weeksElapsed < SEMI_NEW_WEEKS) return "準新作";
  return "旧作";
}
