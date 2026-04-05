import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: bold, uppercase, smooth transitions, lift on hover
  "inline-flex items-center justify-center gap-2 whitespace-normal md:whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Coral-orange primary with glow shadow
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-glow-primary hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-md",

        // Deep teal — secondary brand action
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:shadow-glow-secondary hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0",

        // Gradient paint stripe — for hero / top CTAs
        paint:
          "bg-gradient-to-r from-primary via-[hsl(28_95%_55%)] to-[hsl(42_96%_52%)] text-white shadow-md hover:shadow-glow-primary hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 bg-[size:150%] bg-left hover:bg-right transition-[background-position,box-shadow,transform] duration-500",

        // Lime accent — tertiary / positive action
        accent:
          "bg-accent text-accent-foreground shadow-md hover:shadow-glow-accent hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0",

        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5",

        // Bordered with primary colour
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/8 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",

        // Bordered with secondary colour
        "outline-secondary":
          "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary/8 hover:shadow-md hover:-translate-y-0.5",

        ghost:
          "hover:bg-primary/10 text-foreground hover:-translate-y-0.5 shadow-none hover:shadow-sm",

        link: "text-primary underline decoration-2 underline-offset-4 hover:opacity-80 shadow-none hover:shadow-none hover:-translate-y-0",
      },
      size: {
        xs:      "h-8 px-4 text-xs rounded-lg",
        sm:      "h-9 px-5 text-xs rounded-xl",
        default: "h-11 px-8",
        lg:      "h-12 px-10 text-sm",
        xl:      "h-14 px-12 text-base",
        "2xl":   "h-16 px-14 text-lg rounded-2xl",
        icon:    "h-10 w-10 rounded-full",
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
