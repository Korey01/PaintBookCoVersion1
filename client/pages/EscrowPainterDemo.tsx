import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function EscrowPainterDemo(){
  const [requested, setRequested] = useState(false);
  const requestRelease = () => {
    setRequested(true);
    toast({ title: "Request sent", description: "Your request for release has been sent to the customer." });
  };
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Escrow & Payment Security (Painter Demo)</h1>
      <p className="mt-1 text-sm text-muted-foreground">Funds are guaranteed in escrow — via Stripe (FCA-regulated payment partner). Get paid when customers approve the job.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="border-muted/60">
          <CardContent className="p-6">
            <div className="text-sm font-medium">Escrow overview</div>
            <div className="mt-2 grid gap-1 text-sm">
              <div className="flex items-center justify-between"><span>Total escrow</span><span className="font-medium">£1,120.00</span></div>
              <div className="flex items-center justify-between"><span>Awaiting release</span><span className="font-medium">£420.00</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={requestRelease} disabled={requested}>{requested ? "Requested" : "Request release"}</Button>
              <Button size="sm" variant="secondary" asChild><a href="/disputes">Open dispute</a></Button>
            </div>
            {requested && (
              <div className="mt-2 rounded-md border bg-secondary/70 p-2 text-xs">Request for release has been sent to the customer.</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/60">
          <CardContent className="p-6">
            <div className="text-sm font-medium">Recent jobs</div>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex items-center justify-between"><span>2‑bed flat repaint</span><span>£300.00</span></div>
              <div className="flex items-center justify-between"><span>Exterior front & fence</span><span>£180.00</span></div>
              <div className="flex items-center justify-between"><span>Cabinet respray</span><span>£240.00</span></div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground"><BadgeCheck className="mr-1 inline h-4 w-4 text-primary"/> Customers release when satisfied — you don’t chase payments.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
