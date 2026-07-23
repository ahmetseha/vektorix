"use client";
/* eslint-disable @next/next/no-img-element -- previews may be local data URLs and are intentionally unoptimized */

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import type { VektorRecord } from "@/features/vektors/types";
import { sampleVektors } from "@/features/vektors/samples";
import { encodeDNA } from "@/features/lab/engine/dna";
import { OrganismPoster } from "@/components/shared/OrganismPoster";

const filters = ["Trending", "New", "Most remixed", "Calm", "Chaotic", "Electric", "Organic"];

export function ExploreGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedFilter = searchParams.get("filter");
  const filter = filters.find((value) => value.toLowerCase().replaceAll(" ", "-") === requestedFilter) ?? "Trending";
  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Trending") params.delete("filter");
    else params.set("filter", value.toLowerCase().replaceAll(" ", "-"));
    router.replace(params.size ? `/explore?${params.toString()}` : "/explore", { scroll: false });
  };
  const query = useQuery<{ items: VektorRecord[] }>({ queryKey: ["vektors"], queryFn: async () => { const response = await fetch("/api/vektors"); if (!response.ok) throw new Error("load-failed"); return response.json() as Promise<{ items: VektorRecord[] }>; }, initialData: { items: sampleVektors } });
  const items = useMemo(() => {
    const result = [...query.data.items];
    if (["Calm", "Chaotic", "Electric", "Organic"].includes(filter)) return result.filter((item) => item.dna.archetype === filter.toLowerCase());
    if (filter === "Most remixed") return result.sort((a, b) => b.remixCount - a.remixCount);
    if (filter === "Trending") return result.sort((a, b) => (b.reactionCount + b.remixCount * 2) - (a.reactionCount + a.remixCount * 2));
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filter, query.data.items]);
  return (
    <>
      <div className="filter-row" role="toolbar" aria-label="Filter Vektors">{filters.map((value) => <button type="button" key={value} data-active={filter === value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
      {query.isError && <p role="status" className="inline-status">The live field is offline. Showing preserved specimens.</p>}
      <div className="explore-grid">{items.map((record, index) => <Link className="explore-card" key={record.slug} href={`/v/${record.slug}?data=${encodeDNA(record.dna)}`}><span className="card-index">{String(index + 1).padStart(2, "0")}</span>{record.previewImageUrl ? <img src={record.previewImageUrl} alt={`Preview of ${record.name}`} /> : <OrganismPoster dna={record.dna} label={`Preview of ${record.name}`} />}<div className="card-meta"><span>{record.dna.archetype}</span><h2>{record.name}</h2><p>{record.creator}</p><dl><div><dt>GEN</dt><dd>{record.generation}</dd></div><div><dt>REMIX</dt><dd>{record.remixCount}</dd></div></dl><ArrowUpRight /></div></Link>)}</div>
      <nav className="pagination" aria-label="Explore pagination"><button type="button" disabled>Previous</button><span>Page 1 of 1</span><button type="button" disabled>Next</button></nav>
    </>
  );
}
