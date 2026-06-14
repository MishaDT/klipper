import Link from "next/link";
import { clsx } from "clsx";
import { logoutAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  ["Главная", "/"],
  ["Кампании", "/campaigns"],
  ["Заказчик", "/client"],
  ["Клиппер", "/clipper"],
  ["AI Studio", "/ai-studio"],
  ["Лидерборд", "/leaderboard"],
  ["Аналитика", "/analytics"],
  ["Wallet", "/wallet"],
  ["Админка", "/admin"]
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="logo">CH</span>
          Clippers Hub
        </Link>
        <div className="search">Поиск кампаний, клипперов, выплат</div>
        <div className="top-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name}</span>
              <form action={logoutAction}>
                <button className="btn btn-small" type="submit">Выйти</button>
              </form>
            </>
          ) : (
            <>
              <Link className="btn btn-small" href="/login">Войти</Link>
              <Link className="btn btn-small btn-primary" href="/register">Регистрация</Link>
            </>
          )}
        </div>
      </header>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="side-title">Навигация</div>
          <nav className="side-nav">
            {nav.map(([label, href]) => (
              <Link className="side-link" href={href} key={href}>
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="side-title live-title">Live</div>
          <div className="live-list">
            <LiveItem initials="NX" title="NikitaX Live" subtitle="Twitch -> TikTok" />
            <LiveItem initials="FS" title="FinStudy" subtitle="Podcast -> Shorts" />
            <LiveItem initials="GG" title="GameGate" subtitle="VK Clips sync" />
          </div>
        </aside>
        <main className="content">{children}</main>
      </div>
    </>
  );
}

function LiveItem({ initials, title, subtitle }: { initials: string; title: string; subtitle: string }) {
  return (
    <div className="live-item">
      <div className="avatar">{initials}</div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <i />
    </div>
  );
}

export function Stat({ value, label, tone }: { value: React.ReactNode; label: string; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className={clsx("metric", tone)}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("card", className)}>{children}</section>;
}

export function Tag({ children, tone }: { children: React.ReactNode; tone?: "good" | "warn" | "live" }) {
  return <span className={clsx("tag", tone)}>{children}</span>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
