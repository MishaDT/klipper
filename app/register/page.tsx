import Link from "next/link";
export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="card auth-card">
        <span className="eyebrow">Новый аккаунт</span>
        <h1>Регистрация</h1>
        <form className="form" action="/api/auth/register" method="post">
          <label className="field">Имя<input name="name" defaultValue="New Clipper" required /></label>
          <label className="field">Handle<input name="handle" defaultValue={`user_${Math.floor(Math.random() * 9999)}`} required /></label>
          <label className="field">Email<input name="email" type="email" defaultValue={`user${Math.floor(Math.random() * 9999)}@clippers.local`} required /></label>
          <label className="field">Пароль<input name="password" type="password" defaultValue="password123" required /></label>
          <label className="field">Роль<select name="role" defaultValue="WORKER"><option value="WORKER">Клиппер</option><option value="CLIENT">Заказчик</option><option value="BOTH">Обе роли</option></select></label>
          <button className="btn btn-primary" type="submit">Создать аккаунт</button>
        </form>
        <p className="small">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
      </section>
    </main>
  );
}
