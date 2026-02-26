import Image from "next/image";

import AuthCard from "@/components/ui/forms/forgot-pass-form";
import { ForgotPasswordForm } from "@/components/ui/forms/Login/forgot-password-form";

export default function ForgotPassword() {
  return (
    <div className="container grid h-svh max-w-none items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8">
        <div className="mb-4 flex gap-2 items-center justify-center">
          <Image
            src="/assets/logo_dark.png"
            alt="360 Deutsch Logo"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-medium">360 Deutsch</h1>
        </div>

        <AuthCard
          title="Forgot Password"
          description="Enter the email address associated with your account and we'll send you a link to reset your password."
          footerText="Remember your password?"
          footerLinkText="Sign in"
          footerLinkHref="/login"
        >
          <ForgotPasswordForm />
        </AuthCard>
      </div>
    </div>
  );
}