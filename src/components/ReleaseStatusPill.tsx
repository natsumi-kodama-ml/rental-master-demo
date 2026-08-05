import { CdType, ReleaseStatus } from "@/lib/types";

const STYLES: Record<ReleaseStatus, string> = {
  新作: "bg-gold-400 text-navy-900",
  準新作: "bg-sky-100 text-sky-800",
  旧作: "bg-gray-100 text-gray-500",
};

// CDはシングル/アルバムも新作/準新作/旧作と同じ料金区分の情報なので、
// 別バッジにせず同じピルの中にまとめて表示する。
export default function ReleaseStatusPill({
  status,
  cdType,
}: {
  status: ReleaseStatus | null;
  cdType?: CdType | null;
}) {
  if (!status) {
    return <span className="text-xs text-gray-300">(対象外)</span>;
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STYLES[status]}`}
    >
      {cdType ? `${status}・${cdType}` : status}
    </span>
  );
}
