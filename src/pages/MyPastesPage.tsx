import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { useAuth } from "../lib/auth-context";
import { fetchMyPastes, deletePaste, type MyPasteSummary } from "../lib/api";

export function MyPastesPage() {
  const { user, loading } = useAuth();
  const [pastes, setPastes] = useState<MyPasteSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMyPastes()
      .then((res) => setPastes(res.pastes))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load pastes"));
  }, [user]);

  async function handleDelete(id: string) {
    try {
      await deletePaste(id, null);
      setPastes((prev) => prev?.filter((p) => p._id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this paste.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-sm text-slate-500">loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="font-mono text-sm text-slate-400">
          you need to be{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            logged in
          </Link>{" "}
          to see this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-mono text-lg text-white">your pastes</h1>
      {error && <p className="mb-4 font-mono text-sm text-red-400">{error}</p>}
      {pastes === null ? (
        <p className="font-mono text-sm text-slate-500">loading...</p>
      ) : pastes.length === 0 ? (
        <p className="font-mono text-sm text-slate-500">
          nothing here yet —{" "}
          <Link to="/" className="text-emerald-400 hover:underline">
            create a paste
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {pastes.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3"
            >
              <Link to={`/p/${p._id}`} className="min-w-0 flex-1 truncate font-mono text-sm text-white hover:text-emerald-400">
                {p.title}
              </Link>
              <span className="shrink-0 font-mono text-xs text-slate-500">{p.language}</span>
              <span className="shrink-0 font-mono text-xs text-slate-500">{p.views} views</span>
              <button
                onClick={() => handleDelete(p._id)}
                className="shrink-0 font-mono text-xs text-red-400 hover:underline"
              >
                delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
