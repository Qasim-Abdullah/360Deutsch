"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { forgetPassword } from "@/lib/api/auth";
import { AlertDialogDemo } from "@/components/ui/alerts/AlertDialogDemo";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Invalid email"),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      await forgetPassword(data.email);
      setSubmittedEmail(data.email);
      setShowAlert(true);
      form.reset();
      toast.success(`Email sent to ${data.email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="mt-2" disabled={isLoading} type="submit">
            Continue
            {isLoading ? (
              <Loader2 className="ml-2 animate-spin" />
            ) : (
              <ArrowRight className="ml-2" />
            )}
          </Button>
        </form>
      </Form>

      {showAlert && (
        <AlertDialogDemo
          title="Successful Request"
          description={`We’ve sent a password reset link to ${submittedEmail}. Please check your inbox and follow the instructions to reset your password.`}
          confirmText="Got it"
          onConfirm={() => {
            setShowAlert(false);
            router.push("/login");
          }}
          onClose={() => {
            setShowAlert(false);
            router.push("/login");
          }}
        />
      )}
    </>
  );
}
