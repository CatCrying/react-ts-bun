import { useState } from "react";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      className={`group flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-8 py-12 text-center transition-colors ${
        isDragging
          ? "border-brass bg-brass/10"
          : "border-parchment-dim/30 hover:border-brass/60"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`mb-4 h-10 w-10 transition-colors ${
          isDragging ? "text-brass" : "text-parchment-dim/60 group-hover:text-brass/80"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        />
      </svg>
      <p className="font-display text-lg text-parchment">
        Drop a file into the vault
      </p>
      <p className="mt-1 font-mono text-xs text-parchment-dim/70">
        or click to browse — up to 4 GB per deposit
      </p>
    </div>
  );
}
