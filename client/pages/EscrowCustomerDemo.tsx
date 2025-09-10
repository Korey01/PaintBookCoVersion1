import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ShieldCheck } from "lucide-react";

export default function EscrowCustomerDemo(){
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Escrow & Payment Security (Customer Demo)</h1>
      <p className="mt-1 text-sm text-muted-foreground">100% of your payment is held in escrow until you approve the job. Protected by our Stripe FCA‑regulated partner.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="border-muted/60">
          <CardContent className="p-6">
            <div className="text-sm font-medium">Your escrow balance</div>
            <div className="mt-2 text-2xl font-extrabold">£450.00</div>
            <div className="mt-2 rounded-lg bg-secondary p-3 text-xs"><Lock className="mr-2 inline h-4 w-4"/> Funds are secured until you press “Release”.</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary">Contact painter</Button>
              <Button size="sm">Release funds</Button>
              <Button size="sm" variant="outline" asChild><a href="/disputes">Open dispute</a></Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/60">
          <CardContent className="p-6">
            <div className="text-sm font-medium">Upcoming releases</div>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex items-center justify-between"><span>Kitchen repaint</span><span>£300.00</span></div>
              <div className="flex items-center justify-between"><span>Fence staining</span><span>£150.00</span></div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-4 w-4 text-primary"/> Release only when you are satisfied. Otherwise, start a dispute.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
