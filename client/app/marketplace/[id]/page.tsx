import { MaterialDetailClient } from "./material-detail-client";

export default async function MaterialDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const materialId = params.id;

  return <MaterialDetailClient materialId={materialId} />;
}
