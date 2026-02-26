import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards/card";

type AuthCardProps = {
  title?: string;
  description?: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  children: React.ReactNode;
};

function AuthCard({
  title = "Forgot Password",
  description = "jdjdjhdhdhd",
  footerText = "",
  footerLinkText = "Log in",
  footerLinkHref = "/login",
  children,
}: AuthCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>{children}</CardContent>

      <CardFooter>
        <p className="text-muted-foreground mx-auto px-8 text-center text-sm text-balance">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="hover:text-primary underline underline-offset-4"
          >
            {footerLinkText}
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}

export default AuthCard;
