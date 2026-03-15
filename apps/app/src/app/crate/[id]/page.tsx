import { fetchCrate } from "../../../utils/functions";
import {
  generateRandomRoll,
  generateRandomRollItem,
} from "../../../utils/functions";
import { Crate } from "../../../views/Crate";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CratePage({ params }: Props) {
  const { id } = await params;

  const initialData = await fetchCrate(id);

  if (!initialData) {
    redirect("/crates");
  }

  const initialRolledItems = generateRandomRoll(
    initialData.crateItems,
    generateRandomRollItem(initialData.crateItems),
  );

  return (
    <Crate
      id={id}
      initialData={initialData}
      initialRolledItems={initialRolledItems}
    />
  );
}
