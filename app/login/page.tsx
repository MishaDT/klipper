import Link from "next/link";
export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  void searchParams;
  return (
    <main className="auth-page">
      <section className="card auth-card">
        <span className="eyebrow">Clippers Hub</span>
        <h1>Вход</h1>
        <p className="muted">Тестовые аккаунты после seed: `nikita@clippers.local`, `anya@clippers.local`, `admin@clippers.local`. Пароль: `password123`.</p>
        <form className="form" action="/api/auth/login" method="post">
          <label className="field">Email<input name="email" type="email" defaultValue="anya@clippers.local" required /></label>
          <label className="field">Пароль<input name="password" type="password" defaultValue="password123" required /></label>
          <button className="btn btn-primary" type="submit">Войти</button>
        </form>
        <p className="small">Нет аккаунта? <Link href="/register">Зарегистрироваться</Link></p>
      </section>
    </main>
  );
}
