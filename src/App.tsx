import { RouterProvider, useRouter } from "./lib/router";
import { AuthProvider } from "./lib/auth-context";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { PastePage } from "./pages/PastePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyPastesPage } from "./pages/MyPastesPage";

function Routes() {
  const { path } = useRouter();

  if (path === "/") return <HomePage />;
  if (path === "/login") return <LoginPage />;
  if (path === "/register") return <RegisterPage />;
  if (path === "/me") return <MyPastesPage />;

  const pasteMatch = path.match(/^\/p\/([^/]+)$/);
  if (pasteMatch) return <PastePage id={pasteMatch[1]} />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="font-mono text-sm text-slate-400">page not found</p>
    </div>
  );
}

export function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0e14] text-slate-100">
          <Header />
          <Routes />
        </div>
      </AuthProvider>
    </RouterProvider>
  );
}
