import { fetchCrate } from "../../../utils/functions";
import { Crate } from "../../../views/Crate";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CratePage({ params }: Props) {
  const { id } = await params;

  const initialData = await fetchCrate(id);

  return <Crate id={id} initialData={initialData} />;
}
