import { CdType } from "@/lib/types";

const STYLES: Record<CdType, string> = {
  シングル: "bg-purple-100 text-purple-700",
  アルバム: "bg-indigo-100 text-indigo-700",
};

export default function CdTypeBadge({ cdType }: { cdType: CdType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STYLES[cdType]}`}
    >
      {cdType}
    </span>
  );
}
