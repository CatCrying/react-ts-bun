import { useState, type FormEvent } from "react";
import { useRouter } from "../lib/router";
import { createPaste } from "../lib/api";
import { rememberSecret } from "../lib/local-secrets";
import { SUPPORTED_LANGUAGES } from "../lib/hljs-setup";

const EXPIRY_OPTIONS: { value: string; label: string }[] = [
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
  { value: "never", label: "Never" },
];

export function HomePage() {
  const { navigate } = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<string>("plaintext");
  const [expiry, setExpiry] = useState("1d");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Paste some content first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createPaste({ title, content, language, expiry });
      if (result.secret) {
        rememberSecret(result.id, result.secret);
      }
      navigate(`/p/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Untitled paste"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <textarea
          placeholder="Paste your text or code here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="rounded-md border border-white/10 bg-[#0d1117] px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                expires: {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="ml-auto rounded-md bg-emerald-500 px-5 py-1.5 font-mono text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {submitting ? "saving..." : "create paste"}
          </button>
        </div>
        {error && <p className="font-mono text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
