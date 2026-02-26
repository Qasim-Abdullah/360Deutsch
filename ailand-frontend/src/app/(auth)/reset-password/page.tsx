import AuthCard from "@/components/ui/forms/forgot-pass-form";
import { ResetPasswordForm } from "@/components/ui/forms/Login/reset-password-form";
import { InvalidTokenDialog } from "@/components/ui/alerts/InvalidTokenAlert";
import Image from "next/image";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token = "" } = await searchParams;


  if (!token) {
    return <InvalidTokenDialog />;
  }

  return (
    <div className="container grid h-svh max-w-none items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8">
        <div className="mb-4 gap-2 flex items-center justify-center">
          <Image
            src="/assets/logo_dark.png"
            alt="360 Deutsch Logo"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-medium">360 Deutsch</h1>
        </div>

        <AuthCard
          title="Reset Password"
          description="Please enter your new password."
          footerText="Remember your password?"
          footerLinkText="Sign in"
          footerLinkHref="/sign-in"
        >
          <ResetPasswordForm token={token} />
        </AuthCard>
      </div>
    </div>
  );
}
