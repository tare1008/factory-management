import { LoginForm } from "@/app/login/LoginForm";
import { Logo } from "@/components/Logo";
import { FactoryIllustration } from "@/components/FactoryIllustration";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Logo panel */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-white p-10">
        <FactoryIllustration className="absolute inset-0 h-full w-full scale-110 opacity-25 blur-md" />
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative z-10">
          <Logo theme="dark" size="full" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-deep-space-blue-950 via-deep-space-blue-800 to-steel-blue-700 p-6">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevation-3)]">
          <div className="h-1.5 bg-gradient-to-r from-papaya-whip-400 via-papaya-whip-500 to-papaya-whip-600" />
          <div className="p-8">
            <p className="mat-label mb-1">Welcome back</p>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-brand-navy">
              Material &amp; Operations Management
            </h1>
            <LoginForm callbackUrl={callbackUrl ?? "/"} />
          </div>
        </div>
      </div>
    </div>
  );
}
