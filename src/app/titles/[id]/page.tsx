import TitleDetailView from "@/components/TitleDetailView";

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TitleDetailView titleId={id} />;
}
