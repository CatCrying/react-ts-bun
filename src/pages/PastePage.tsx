import { useEffect, useState } from "react";
import { useRouter, Link } from "../lib/router";
import { getPaste, deletePaste, type PasteView } from "../lib/api";
import { getRememberedSecret, forgetSecret } from "../lib/local-secrets";
import { useAuth } from "../lib/auth-context";
import { CodeBlock } from "../components/CodeBlock";

interface Props {
  id: string;
}

export function PastePage({ id }: Props) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [paste, setPaste] = useState<PasteView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setPaste(null);
    setError(null);
    getPaste(id)
      .then(setPaste)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load paste"));
  }, [id]);

  const localSecret = getRememberedSecret(id);
  const canAttemptDelete = Boolean(localSecret) || Boolean(user);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePaste(id, localSecret);
      forgetSecret(id);
      navigate("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete this paste.");
    } finally {
      setDeleting(false);
    }
  }

  function handleCopy() {
    if (!paste) return;
    navigator.clipboard.writeText(paste.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="font-mono text-sm text-red-400">{error}</p>
        <Link to="/" className="mt-4 inline-block font-mono text-sm text-emerald-400 hover:underline">
          create a new paste
        </Link>
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-sm text-slate-500">loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-mono text-lg text-white">{paste.title}</h1>
        <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
          <span>{paste.views} views</span>
          <span>
            {paste.expiresAt
              ? `expires ${new Date(paste.expiresAt).toLocaleString()}`
              : "never expires"}
          </span>
        </div>
      </div>

      <CodeBlock code={paste.content} language={paste.language} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopy}
          className="rounded-md border border-white/10 px-4 py-1.5 font-mono text-sm text-slate-200 hover:border-emerald-500 hover:text-emerald-400"
        >
          {copied ? "copied!" : "copy"}
        </button>
        {canAttemptDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md border border-red-500/40 px-4 py-1.5 font-mono text-sm text-red-400 hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? "deleting..." : "delete"}
          </button>
        )}
        {deleteError && <span className="font-mono text-sm text-red-400">{deleteError}</span>}
      </div>
    </div>
  );
}
