import { prisma } from "@/lib/prisma";
import { commissionRate } from "@/lib/money";
import { stringify } from "@/lib/json";

export async function syncMockViews() {
  const submissions = await prisma.submission.findMany({
    include: { campaign: true, worker: true },
    where: { status: { in: ["POSTED", "VERIFIED", "THRESHOLD_MET", "SETTLING"] } },
    orderBy: { createdAt: "asc" },
    take: 200
  });

  const updates = [];

  for (const submission of submissions) {
    const velocity = 1800 + Math.floor(Math.random() * 38000);
    const views = submission.currentViews + velocity;
    const likes = submission.currentLikes + Math.floor(velocity * (0.035 + Math.random() * 0.04));
    const comments = submission.currentComments + Math.floor(velocity * (0.001 + Math.random() * 0.005));
    const ratio = likes === 0 ? 999 : views / likes;
    const fraudScore = Math.min(96, Math.max(4, Math.round(ratio > 200 ? 75 : 8 + Math.random() * 24)));
    const status =
      fraudScore >= 70
        ? "REJECTED"
        : views >= submission.campaign.viewThreshold && submission.status !== "SETTLING"
          ? "THRESHOLD_MET"
          : submission.status === "THRESHOLD_MET"
            ? "SETTLING"
            : submission.status;

    const updated = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        currentViews: views,
        currentLikes: likes,
        currentComments: comments,
        peakViews: Math.max(views, submission.peakViews),
        fraudScore,
        status,
        lastSyncedAt: new Date(),
        viewVelocityJson: stringify([submission.currentViews, views])
      }
    });

    if (status === "SETTLING" && submission.status === "THRESHOLD_MET") {
      const gross = Math.floor((views / 1000) * submission.campaign.cpmRateCents);
      const fee = Math.floor(gross * commissionRate(submission.worker.rank));
      const net = gross - fee;
      await prisma.transaction.create({
        data: {
          userId: submission.workerId,
          submissionId: submission.id,
          amountCents: gross,
          feeCents: fee,
          netCents: net,
          type: "EARNING",
          status: "PENDING",
          providerData: stringify({ settlementHours: 48, fraudScore })
        }
      });
      await prisma.user.update({
        where: { id: submission.workerId },
        data: {
          holdBalanceCents: { increment: net },
          lifetimeViews: { increment: velocity }
        }
      });
    }

    updates.push(updated);
  }

  return { synced: updates.length, submissions: updates };
}
