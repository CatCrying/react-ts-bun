import { useState, type FormEvent } from "react";
import { useRouter, Link } from "../lib/router";
import { login } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export function LoginPage() {
  const { navigate } = useRouter();
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(username, password);
      setUser(user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 font-mono text-lg text-white">log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 font-mono text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          {submitting ? "logging in..." : "log in"}
        </button>
        {error && <p className="font-mono text-sm text-red-400">{error}</p>}
      </form>
      <p className="mt-4 font-mono text-xs text-slate-500">
        no account?{" "}
        <Link to="/register" className="text-emerald-400 hover:underline">
          register
        </Link>
      </p>
    </div>
  );
}
