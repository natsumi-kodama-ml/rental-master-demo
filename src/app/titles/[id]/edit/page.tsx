import TitleForm from "@/components/TitleForm";

export default async function EditTitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TitleForm mode="edit" titleId={id} />;
}
