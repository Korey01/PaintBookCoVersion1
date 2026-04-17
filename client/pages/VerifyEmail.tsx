import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck, ShieldCheck } from "lucide-react";

export default function VerifyEmail(){
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const email = params.get('email') || '';
  const next = params.get('next') || '/dashboard';

  function verify(){
    navigate(next);
  }

  return (
    <div className="container mx-auto px-4 py-16 grid gap-6 md:max-w-lg text-center">
      <MailCheck className="mx-auto h-12 w-12 text-primary"/>
      <h1 className="text-2xl font-bold">Verify your email</h1>
      <p className="text-sm text-muted-foreground">We sent a verification link to {email || 'your email'}.</p>
      <Card className="border-muted/60 text-left mx-auto w-full">
        <CardContent className="p-6">
          <div className="text-sm">This is a mock verification step. Click below to confirm.</div>
          <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Email verification helps protect your account.</div>
          <Button className="mt-4 w-full" onClick={verify}>I have verified my email</Button>
        </CardContent>
      </Card>
    </div>
  );
}
