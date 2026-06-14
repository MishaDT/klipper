import { AppShell, Card } from "@/components/ui";
import { createCampaignAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";

export default async function NewCampaignPage() {
  await requireUser();
  return (
    <AppShell>
      <section className="section">
        <span className="eyebrow">Создание кампании</span>
        <h1>Запусти CPV-кампанию с tracking-code и антифродом.</h1>
      </section>
      <section className="section grid grid-2">
        <Card>
          <form className="form" action={createCampaignAction}>
            <label className="field">Название<input name="title" defaultValue="Новая Twitch CPV кампания" required /></label>
            <label className="field">Описание<textarea name="description" defaultValue="Нужны короткие клипы из длинного VOD: мемные моменты, реакции, динамичные первые 2 секунды." /></label>
            <label className="field">Источник<input name="sourceUrl" defaultValue="https://twitch.tv/videos/source" required /></label>
            <label className="field">Площадка источника<select name="sourcePlatform" defaultValue="TWITCH"><option value="TWITCH">Twitch</option><option value="YOUTUBE">YouTube</option><option value="VK">VK</option></select></label>
            <label className="field">Ниша<input name="niche" defaultValue="Gaming" /></label>
            <label className="field">Tracking prefix<input name="trackingPrefix" defaultValue="NX24" /></label>
            <div className="check-grid">
              {["TIKTOK", "YOUTUBE", "INSTAGRAM", "VK", "TWITCH"].map((platform) => (
                <label className="check" key={platform}><input type="checkbox" name="platforms" value={platform} defaultChecked={platform !== "TWITCH"} />{platform}</label>
              ))}
            </div>
            <label className="field">Обязательные теги<input name="requiredTags" defaultValue="#nikitax, #ch_NX24" /></label>
            <label className="field">Запреты<input name="bans" defaultValue="NSFW, политика, конкуренты в кадре" /></label>
            <label className="check"><input name="watermarkBonus" type="checkbox" defaultChecked /> Watermark bonus +5%</label>
            <div className="grid grid-2">
              <label className="field">CPV, ₽ за 1000<input name="cpm" type="number" defaultValue="48" /></label>
              <label className="field">Порог просмотров<input name="viewThreshold" type="number" defaultValue="10000" /></label>
            </div>
            <div className="grid grid-2">
              <label className="field">Бюджет, ₽<input name="budget" type="number" defaultValue="120000" /></label>
              <label className="field">Дедлайн<input name="deadline" type="date" defaultValue="2026-06-28" /></label>
            </div>
            <label className="field">Видимость<select name="visibility" defaultValue="FEATURED"><option value="FEATURED">Featured</option><option value="PUBLIC">Public</option><option value="PRIVATE_INVITE">Private invite</option></select></label>
            <input type="hidden" name="language" value="ru" />
            <button className="btn btn-primary" type="submit">Опубликовать кампанию</button>
          </form>
        </Card>
        <Card>
          <span className="eyebrow">AI Preview</span>
          <h2>Что будет создано</h2>
          <div className="row"><span>Примерный охват</span><strong>2.5M views</strong></div>
          <div className="row"><span>Ожидаемые клипы</span><strong>260</strong></div>
          <div className="row"><span>Клипперы</span><strong>80-90</strong></div>
          <div className="row"><span>Антифрод</span><strong>7 слоев</strong></div>
          <p className="muted">После запуска средства резервируются в wallet ledger, а клипперы получают кампанию в витрине.</p>
        </Card>
      </section>
    </AppShell>
  );
}
