import { DealType } from "@/lib/types";

const STYLES: Record<DealType, string> = {
  新品: "bg-navy-100 text-navy-700",
  中古: "bg-amber-100 text-amber-700",
  レンタル: "bg-gold-400 text-navy-900",
};

export default function DealTypeBadge({ dealType }: { dealType: DealType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STYLES[dealType]}`}
    >
      {dealType}
    </span>
  );
}
