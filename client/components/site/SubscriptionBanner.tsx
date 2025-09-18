import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";

export type Plan = "Starter" | "Professional" | "Premium";

export default function SubscriptionBanner({ onSelect }: { onSelect: (plan: Plan) => void }){
  return (
    <div className="rounded-2xl border bg-card/80 p-6 shadow-sm md:p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🎨 Choose Your Perfect Plan – Simple, Affordable, Transparent</h2>
        <p className="mt-2 text-sm text-muted-foreground">👉 No commission. Keep 100% of your earnings. Cancel anytime.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-muted/60">
          <CardContent className="p-6">
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-semibold">Starter</div>
              <div className="text-2xl font-extrabold">£10<span className="text-sm font-medium text-muted-foreground">/mo</span></div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Verified profile & portfolio</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Access to local jobs</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Basic customer support</li>
            </ul>
            <Button className="mt-5 w-full" onClick={()=>onSelect("Starter")}>Get Starter</Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-semibold">Professional</div>
              <div className="text-2xl font-extrabold">£20<span className="text-sm font-medium text-muted-foreground">/mo</span></div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> All Starter benefits</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Higher job visibility in searches</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Eligibility for partner discounts (paints & tools)</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Priority customer support</li>
            </ul>
            <Button className="mt-5 w-full" onClick={()=>onSelect("Professional")}>Go Professional</Button>
          </CardContent>
        </Card>

        <Card className="border-primary/60 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-semibold">Premium</div>
              <div className="text-2xl font-extrabold">£35<span className="text-sm font-medium text-muted-foreground">/mo</span></div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> All Professional benefits</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Top search ranking & “Premium” badge</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Access to larger, high-value jobs</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary"/> Exclusive rewards & loyalty perks</li>
            </ul>
            <Button className="mt-5 w-full" onClick={()=>onSelect("Premium")}>Go Premium</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
