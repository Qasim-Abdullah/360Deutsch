"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/sidebar/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms/form";
import { Input } from "@/components/ui/sidebar/input";
import { AlertDialogDemo } from "@/components/ui/alerts/AlertDialogDemo";
import { resetPassword } from "@/lib/api/auth";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.HTMLAttributes<HTMLFormElement>) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(6);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!showSuccess) return;

    const TOTAL_SECONDS = 6;
    setSecondsLeft(TOTAL_SECONDS);

    const interval = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    const timeout = window.setTimeout(() => {
      router.push("/login");
    }, TOTAL_SECONDS * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [showSuccess, router]);

  async function onSubmit(data: FormValues) {
    if (!token) {
      toast.error("Missing or invalid reset token.");
      return;
    }

    setIsLoading(true);

    toast.promise(
      (async () => {
        return await resetPassword({ token, new_password: data.password });
      })(),
      {
        loading: "Resetting password...",
        success: () => {
          form.reset();
          setShowSuccess(true);
          return "Password reset successfully!";
        },
        error: (e) => e?.message ?? "Something went wrong",
        finally: () => setIsLoading(false),
      }
    );
  }

  const goToLoginNow = () => {
    router.push("/login");
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("grid gap-2", className)}
          {...props}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="mt-2" disabled={isLoading} type="submit">
            Reset Password
            {isLoading ? (
              <Loader2 className="ml-2 animate-spin" />
            ) : (
              <ArrowRight className="ml-2" />
            )}
          </Button>
        </form>
      </Form>

      {showSuccess && (
        <AlertDialogDemo
          title="Password Reset Successful"
          description={`Your password has been updated. You will be redirected to the login page in ${secondsLeft} second${
            secondsLeft === 1 ? "" : "s"
          }.`}
          confirmText="Go to login now"
          onConfirm={goToLoginNow}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
}
