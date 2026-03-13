import { fetchCrates } from "../../utils/functions";
import { Crates } from "../../views/Crates";

export default async function CratesPage() {
  const initialData = await fetchCrates();

  return <Crates initialData={initialData} />;
}
