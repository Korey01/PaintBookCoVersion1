import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function CheckoutConfirmation(){
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const ref = params.get('ref') || '';
  const list = JSON.parse(localStorage.getItem('paintbook:payments')||'[]');
  const payment = list.find((p:any)=>p.ref===ref) || {};

  const isSub = payment.mode === 'subscription';

  return (
    <div className="container mx-auto px-4 py-16 grid gap-6 md:max-w-xl text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-primary"/>
      <h1 className="text-2xl font-bold">Payment successful</h1>
      <p className="text-sm text-muted-foreground">Reference: {ref}</p>
      {payment.mode === 'booking' && (
        <p className="text-sm text-muted-foreground inline-flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Your deposit is escrow‑protected and will be released on completion.</p>
      )}
      <Card className="border-muted/60 text-left mx-auto w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-sm"><span>Amount</span><span className="font-semibold">£{payment.amount}</span></div>
          <div className="mt-1 flex items-center justify-between text-sm"><span>Provider</span><span>Stripe</span></div>
          {isSub ? (
            <div className="mt-1 flex items-center justify-between text-sm"><span>Plan</span><span>{payment.plan}</span></div>
          ) : (
            <div className="mt-1 flex items-center justify-between text-sm"><span>Booking for</span><span>{payment.painter || 'Painter'}</span></div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        {isSub ? (
          <>
            <Button onClick={()=>navigate('/dashboard')}>Go to Dashboard</Button>
            <Button variant="secondary" onClick={()=>navigate('/find-painter')}>Browse jobs</Button>
          </>
        ) : (
          <>
            <Button onClick={()=>navigate('/messages')}>Open Messages</Button>
            <Button variant="secondary" onClick={()=>navigate('/post-job')}>Post job details</Button>
          </>
        )}
      </div>
    </div>
  );
}
