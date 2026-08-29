import { Link } from "../lib/router";
import { useAuth } from "../lib/auth-context";
import { logout } from "../lib/api";

export function Header() {
  const { user, setUser } = useAuth();

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-mono text-lg font-semibold text-emerald-400">
          pastebin
        </Link>
        <nav className="flex items-center gap-4 font-mono text-sm text-slate-300">
          <Link to="/" className="hover:text-white">
            new
          </Link>
          {user ? (
            <>
              <Link to="/me" className="hover:text-white">
                {user.username}
              </Link>
              <button
                onClick={() => {
                  logout().then(() => setUser(null));
                }}
                className="hover:text-white"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-white">
                login
              </Link>
              <Link to="/register" className="hover:text-white">
                register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
