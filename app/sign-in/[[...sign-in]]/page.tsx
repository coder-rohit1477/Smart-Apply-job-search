import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/auth";
import { routes } from "@/utils/routes";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <SignIn
          appearance={clerkAppearance}
          path={routes.signIn}
          routing="path"
          signUpUrl={routes.signUp}
          fallbackRedirectUrl={routes.dashboard}
        />
      </div>
    </div>
  );
}
