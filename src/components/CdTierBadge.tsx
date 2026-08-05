import { CdType } from "@/lib/types";

const STYLES: Record<CdType, string> = {
  "アルバム(新作)": "bg-gold-400 text-navy-900",
  "アルバム(旧作)": "bg-gray-100 text-gray-500",
  シングル: "bg-gray-100 text-gray-500",
};

export default function CdTierBadge({ cdType }: { cdType: CdType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STYLES[cdType]}`}
    >
      {cdType}
    </span>
  );
}
