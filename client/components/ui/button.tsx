import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — editorial, refined, sentence-case, no shadow
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide ring-offset-background transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // Squarespace primary — dark fill, white text
        default:
          "bg-foreground text-background hover:bg-foreground/85 active:bg-foreground/75",

        // Outlined — transparent with dark border, fills on hover
        outline:
          "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background active:bg-foreground/85",

        // Outlined light — for dark section backgrounds
        "outline-light":
          "border border-white/60 bg-transparent text-white hover:bg-white hover:text-foreground active:bg-white/90",

        // Coral accent — primary CTA
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75",

        // Ghost — no border, minimal
        ghost:
          "bg-transparent text-foreground hover:bg-foreground/6 active:bg-foreground/10",

        // Ghost light — for dark backgrounds
        "ghost-light":
          "bg-transparent text-white/80 hover:text-white hover:bg-white/10",

        // Link — underline style
        link:
          "bg-transparent text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-all p-0 h-auto",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85",
      },
      size: {
        sm:      "h-9 px-5 text-xs tracking-wide",
        default: "h-11 px-7",
        lg:      "h-12 px-9 text-sm",
        xl:      "h-14 px-12 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
