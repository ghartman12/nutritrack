import { redirect } from "next/navigation";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";

export default async function Home() {
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
    include: { settings: true },
  });

  if (!user?.settings?.onboardingComplete) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
