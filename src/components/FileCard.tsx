import type { VaultFile, FileKind } from "../types";

const kindLabel: Record<FileKind, string> = {
  document: "DOC",
  image: "IMG",
  archive: "ZIP",
  audio: "AUD",
  video: "VID",
};

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

interface FileCardProps {
  file: VaultFile;
}

export function FileCard({ file }: FileCardProps) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-sm bg-parchment shadow-[0_2px_0_0_rgba(0,0,0,0.25)]">
      <div className="perforation w-4 shrink-0 border-r border-dashed border-ink/20" />
      <div className="flex flex-1 items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-sm bg-ink px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-brass">
            {kindLabel[file.kind]}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] text-ink">
              {file.name}
            </p>
            <p className="font-mono text-[11px] text-ink/50">
              {file.storedAt}
              {file.expiresIn && (
                <span className="text-rust"> · expires in {file.expiresIn}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {file.shared && (
            <span className="rounded-full border border-moss/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-moss">
              Shared
            </span>
          )}
          <span className="w-16 text-right font-mono text-xs tabular-nums text-ink/60">
            {formatSize(file.sizeMb)}
          </span>
        </div>
      </div>
    </div>
  );
}
