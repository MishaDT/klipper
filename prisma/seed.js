const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const json = (value) => JSON.stringify(value);
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.disputeCase.deleteMany();
  await prisma.leaderboardSnapshot.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@clippers.local",
      passwordHash,
      name: "Миша Admin",
      handle: "misha_admin",
      role: "ADMIN",
      balanceCents: 0,
      rank: "LEGENDARY",
      trustScore: 100,
      referralCode: "ADMIN"
    }
  });

  const client = await prisma.user.create({
    data: {
      email: "nikita@clippers.local",
      passwordHash,
      name: "NikitaX Live",
      handle: "nikitax",
      role: "CLIENT",
      balanceCents: 18420000,
      holdBalanceCents: 51280000,
      referralCode: "NIKITA24",
      trustScore: 98
    }
  });

  const worker = await prisma.user.create({
    data: {
      email: "anya@clippers.local",
      passwordHash,
      name: "Аня Clips",
      handle: "anya_clips",
      role: "WORKER",
      balanceCents: 1824000,
      holdBalanceCents: 788000,
      rank: "GOLD",
      trustScore: 94,
      streakDays: 18,
      lifetimeViews: 3800000,
      referralCode: "ANYA18"
    }
  });

  const brand = await prisma.user.create({
    data: {
      email: "brand@clippers.local",
      passwordHash,
      name: "EduPro Growth",
      handle: "edupro",
      role: "CLIENT",
      balanceCents: 42000000,
      holdBalanceCents: 24000000,
      referralCode: "EDUPRO",
      trustScore: 96
    }
  });

  await prisma.socialAccount.createMany({
    data: [
      { userId: worker.id, platform: "TIKTOK", externalId: "tt_anya", handle: "@anya_clips", verifiedAt: new Date() },
      { userId: worker.id, platform: "YOUTUBE", externalId: "yt_anya", handle: "@anyaShorts", verifiedAt: new Date() },
      { userId: worker.id, platform: "INSTAGRAM", externalId: "ig_anya", handle: "@anya.reels", verifiedAt: new Date() },
      { userId: client.id, platform: "TWITCH", externalId: "tw_nikitax", handle: "NikitaXLive", verifiedAt: new Date() }
    ]
  });

  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        ownerId: client.id,
        title: "NikitaX Live: лучшие моменты стрима",
        description: "Источник Twitch VOD 3ч 42м. Нужны мемные нарезки для TikTok, Shorts, Reels и VK Клипов.",
        sourceUrl: "https://twitch.tv/videos/nikitax-4829",
        sourcePlatform: "TWITCH",
        allowedPlatformsJson: json(["TIKTOK", "YOUTUBE", "INSTAGRAM", "VK"]),
        rulesJson: json({ requiredTags: ["#nikitax", "#ch_NX24"], bans: ["NSFW", "политика", "конкуренты в кадре"], watermarkBonus: true }),
        cpmRateCents: 5600,
        viewThreshold: 10000,
        totalBudgetCents: 18000000,
        remainingBudgetCents: 12240000,
        status: "ACTIVE",
        visibility: "FEATURED",
        trackingPrefix: "ch_NX24",
        deadline: daysFromNow(14),
        language: "ru",
        niche: "Gaming",
        metricsJson: json({ views: 4200000, roi: 3.4, fillRate: 0.68 })
      }
    }),
    prisma.campaign.create({
      data: {
        ownerId: brand.id,
        title: "FinStudy Podcast: короткие инсайты про деньги",
        description: "Длинный выпуск 96 минут. Нужны спокойные экспертные клипы без кликбейта.",
        sourceUrl: "https://youtube.com/watch?v=finstudy-96",
        sourcePlatform: "YOUTUBE",
        allowedPlatformsJson: json(["YOUTUBE", "TIKTOK", "INSTAGRAM"]),
        rulesJson: json({ requiredTags: ["#finstudy", "#ch_FS90"], bans: ["политика", "гарантированный доход"], watermarkBonus: false }),
        cpmRateCents: 4800,
        viewThreshold: 7000,
        totalBudgetCents: 9200000,
        remainingBudgetCents: 4784000,
        status: "ACTIVE",
        visibility: "PUBLIC",
        trackingPrefix: "ch_FS90",
        deadline: daysFromNow(21),
        language: "ru",
        niche: "Podcast",
        metricsJson: json({ views: 1180000, roi: 2.8, fillRate: 0.48 })
      }
    }),
    prisma.campaign.create({
      data: {
        ownerId: client.id,
        title: "GameGate: хайлайты турнира",
        description: "Кампания заканчивается, но заказчик включил 1-click top-up при достижении 95%.",
        sourceUrl: "https://twitch.tv/videos/gamegate-72",
        sourcePlatform: "TWITCH",
        allowedPlatformsJson: json(["TIKTOK", "VK", "TWITCH"]),
        rulesJson: json({ requiredTags: ["#gamegate", "#ch_GG82"], bans: ["токсичность"], watermarkBonus: true }),
        cpmRateCents: 3900,
        viewThreshold: 5000,
        totalBudgetCents: 12000000,
        remainingBudgetCents: 3400000,
        status: "LOW_BUDGET",
        visibility: "FEATURED",
        trackingPrefix: "ch_GG82",
        deadline: daysFromNow(7),
        language: "ru",
        niche: "Gaming",
        metricsJson: json({ views: 2400000, roi: 3.1, fillRate: 0.83 })
      }
    })
  ]);

  const submissions = await Promise.all([
    prisma.submission.create({
      data: {
        campaignId: campaigns[0].id,
        workerId: worker.id,
        postUrl: "https://tiktok.com/@anya_clips/video/10001",
        platform: "TIKTOK",
        platformPostId: "10001",
        trackingCode: "ch_NX24_A01",
        currentViews: 842000,
        currentLikes: 48600,
        currentComments: 1204,
        peakViews: 842000,
        status: "PAID",
        fraudScore: 9,
        viewVelocityJson: json([1200, 7200, 48800, 260000, 842000]),
        paidAt: new Date()
      }
    }),
    prisma.submission.create({
      data: {
        campaignId: campaigns[1].id,
        workerId: worker.id,
        postUrl: "https://youtube.com/shorts/fs-42",
        platform: "YOUTUBE",
        platformPostId: "fs-42",
        trackingCode: "ch_FS90_A02",
        currentViews: 128000,
        currentLikes: 7400,
        currentComments: 260,
        peakViews: 128000,
        status: "SETTLING",
        fraudScore: 18,
        viewVelocityJson: json([900, 5600, 21000, 68000, 128000])
      }
    }),
    prisma.submission.create({
      data: {
        campaignId: campaigns[2].id,
        workerId: worker.id,
        postUrl: "https://vk.com/clip-10002",
        platform: "VK",
        platformPostId: "vk-10002",
        trackingCode: "ch_GG82_A03",
        currentViews: 318000,
        currentLikes: 16000,
        currentComments: 418,
        peakViews: 318000,
        status: "THRESHOLD_MET",
        fraudScore: 14,
        viewVelocityJson: json([400, 12000, 59000, 181000, 318000])
      }
    })
  ]);

  await prisma.transaction.createMany({
    data: [
      { userId: client.id, amountCents: 12000000, feeCents: 348000, netCents: 12000000, type: "DEPOSIT", status: "COMPLETED", provider: "yookassa", providerData: json({ mode: "seed" }) },
      { userId: worker.id, submissionId: submissions[0].id, amountCents: 4715200, feeCents: 518672, netCents: 4196528, type: "EARNING", status: "COMPLETED", providerData: json({ rank: "GOLD", commissionRate: 0.11 }) },
      { userId: worker.id, amountCents: 214000, feeCents: 0, netCents: 214000, type: "STREAK_BONUS", status: "COMPLETED", providerData: json({ streakDays: 18 }) }
    ]
  });

  const achievements = await Promise.all([
    prisma.achievement.create({ data: { code: "FIRST_CLIP", title: "Первый клип", description: "Первая одобренная публикация", icon: "▶" } }),
    prisma.achievement.create({ data: { code: "ONE_HUNDRED_K", title: "100K просмотров", description: "Один клип набрал 100K+", icon: "100K" } }),
    prisma.achievement.create({ data: { code: "STREAK_7", title: "Streak 7", description: "7 дней подряд с публикациями", icon: "7" } })
  ]);

  await prisma.userAchievement.createMany({
    data: achievements.map((achievement) => ({ userId: worker.id, achievementId: achievement.id }))
  });

  await prisma.leaderboardSnapshot.createMany({
    data: [
      { season: "S2-2026", type: "daily", handle: "anya_clips", rank: 1, views: 842000, payoutCents: 1824000 },
      { season: "S2-2026", type: "daily", handle: "maks_cut", rank: 2, views: 691000, payoutCents: 1681000 },
      { season: "S2-2026", type: "daily", handle: "reels_dasha", rank: 3, views: 512000, payoutCents: 1142000 }
    ]
  });

  await prisma.notification.createMany({
    data: [
      { userId: worker.id, title: "Порог достигнут", body: "Клип ch_NX24_A01 принес ₽41 965 после комиссии.", channel: "telegram", priority: "HIGH" },
      { userId: client.id, title: "Кампания LOW_BUDGET", body: "GameGate дошла до 83% бюджета. Включен 1-click top-up.", channel: "push", priority: "HIGH" },
      { userId: admin.id, title: "Fraud queue чистая", body: "Нет публикаций с fraud score выше 70.", channel: "in-app", priority: "LOW" }
    ]
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_DATABASE",
      entity: "System",
      entityId: "seed",
      metadata: json({ users: 4, campaigns: campaigns.length, submissions: submissions.length })
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
