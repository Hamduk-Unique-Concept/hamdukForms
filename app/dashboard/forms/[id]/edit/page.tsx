import { redirect } from 'next/navigation';

export default async function EditFormRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/forms/${id}`);
}
