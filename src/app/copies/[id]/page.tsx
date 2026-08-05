import CopyHistoryView from "@/components/CopyHistoryView";

export default async function CopyHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CopyHistoryView copyId={id} />;
}
