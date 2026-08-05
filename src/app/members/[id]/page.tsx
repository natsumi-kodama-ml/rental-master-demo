import MemberHistoryView from "@/components/MemberHistoryView";

export default async function MemberHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MemberHistoryView memberId={id} />;
}
