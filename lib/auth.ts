import { auth, currentUser } from "@clerk/nextjs/server";

export const clerkAppearance = {
  elements: {
    cardBox: "shadow-none",
    card: "border border-border/70 bg-card/85 text-card-foreground shadow-[0_30px_100px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl",
    headerTitle: "text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border border-border bg-background text-foreground hover:bg-secondary",
    formButtonPrimary:
      "bg-foreground text-background shadow-lg shadow-foreground/10 hover:bg-foreground/90",
    formFieldInput:
      "rounded-2xl border border-input bg-background text-foreground shadow-sm",
    formFieldLabel: "text-foreground",
    footerActionLink: "text-primary hover:text-primary/80",
  },
};

export async function getCurrentSessionUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  return {
    id: userId,
    firstName: user?.firstName ?? user?.username ?? "there",
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  };
}
