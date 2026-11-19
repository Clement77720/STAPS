/**
 * AuthCard — carte commune aux pages de connexion / inscription / mot de passe.
 */
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter className="justify-center text-sm text-muted-foreground">{footer}</CardFooter> : null}
    </Card>
  );
}
