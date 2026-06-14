import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/login?error=bad_credentials", request.url), 303);
  }
  await createSession(user.id);
  const target = user.role === "CLIENT" ? "/client" : user.role === "ADMIN" ? "/admin" : "/clipper";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
