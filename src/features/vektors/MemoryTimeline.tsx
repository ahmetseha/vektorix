import Link from "next/link";
import { OrganismPoster } from "@/components/shared/OrganismPoster";
import { encodeDNA } from "@/features/lab/engine/dna";
import { formatMemory } from "@/features/simulation/resolvers/format-memory";
import { getBiomeDefinition } from "@/features/simulation/registries/biomes";
import type { VektorRecord } from "./types";

export function MemoryTimeline({ record }: { record: VektorRecord }) {
  const biome = getBiomeDefinition(record.state.currentBiome);
  const data = encodeDNA(record.dna);
  const memories = [...record.memories].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );

  return (
    <main id="main-content" className="memory-page">
      <header className="memory-intro">
        <div className="memory-organism">
          <OrganismPoster dna={record.dna} label={`${record.name} organism`} />
        </div>
        <div>
          <p className="eyebrow">LIFE ARCHIVE / {biome.name}</p>
          <h1>
            {record.name}
            <br />
            remembers.
          </h1>
          <p>
            Readable traces of release, movement and environmental change. Raw simulation metadata
            remains behind the record.
          </p>
          <Link href={`/field/${record.state.currentBiome}?slug=${record.slug}&data=${data}`}>
            Return to its field <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>
      <section className="memory-timeline" aria-labelledby="memory-title">
        <h2 id="memory-title">Memory timeline</h2>
        {memories.length ? (
          <ol>
            {memories.map((memory) => (
              <li key={memory.id}>
                <time dateTime={memory.createdAt}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(memory.createdAt))}
                </time>
                <div>
                  <p className="section-index">{memory.type.replaceAll("-", " ")}</p>
                  <h3>{memory.title}</h3>
                  <p>{formatMemory(memory)}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p>No memories have formed yet.</p>
        )}
      </section>
    </main>
  );
}
