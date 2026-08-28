import { StorageDial } from "./components/StorageDial";
import { UploadZone } from "./components/UploadZone";
import { FileCard } from "./components/FileCard";
import { files, usedGb, totalGb } from "./data";

export function App() {
  return (
    <div className="min-h-screen bg-ink text-parchment">
      <header className="border-b border-parchment-dim/10 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold tracking-tight text-brass">
              Vaultdrop
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-widest text-parchment-dim/50 sm:inline">
              deposit &amp; retrieve
            </span>
          </div>
          <button className="rounded-sm border border-brass/50 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-brass transition-colors hover:bg-brass hover:text-ink">
            New deposit
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex flex-col items-center gap-3 rounded-sm border border-parchment-dim/10 bg-ink-soft px-8 py-8">
            <StorageDial usedGb={usedGb} totalGb={totalGb} />
            <p className="text-center font-mono text-[11px] text-parchment-dim/60">
              {(totalGb - usedGb).toFixed(1)} GB free
            </p>
          </div>

          <UploadZone />
        </div>

        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg text-parchment">
              Your deposits
            </h2>
            <span className="font-mono text-[11px] text-parchment-dim/50">
              {files.length} items
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
