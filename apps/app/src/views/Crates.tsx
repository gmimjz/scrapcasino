"use client";

import { GetCratesResponse } from "../client/api";
import { Crate } from "../components/Crate";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useCrates } from "../queries/useCrates";
import { Sort } from "../utils/enums";
import { useState } from "react";

type Props = {
  initialData: GetCratesResponse | null;
};

export const Crates = ({ initialData }: Props) => {
  const [searchInput, setSearchInput] = useState("");
  const [sortSelect, setSortSelect] = useState(Sort.MostPopular);

  const cratesData = useCrates(initialData);

  const crates = cratesData?.crates ?? [];

  return (
    <div className="mx-2 my-8">
      <h1 className="text-2xl font-bold text-white">CRATES</h1>
      <div className="mt-4 flex flex-col justify-between gap-2 sm:flex-row">
        <div className="w-full sm:w-[200px]">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e)}
            placeholder="Search a crate..."
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            selectedItem={sortSelect}
            items={[
              Sort.MostPopular,
              Sort.LeastPopular,
              Sort.PriceAscending,
              Sort.PriceDescending,
              Sort.Newest,
              Sort.Oldest,
            ]}
            onChange={(e) => setSortSelect(e as Sort)}
          />
        </div>
      </div>
      <div className="mt-2 grid w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
        {crates.map((crate) => (
          <Crate
            key={crate.id}
            id={crate.id}
            name={crate.name}
            icon={crate.imageUrl}
            cost={crate.cost}
          />
        ))}
      </div>
    </div>
  );
};
