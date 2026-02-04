import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal md:whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/95",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/5",
        secondary: "bg-accent text-accent-foreground hover:bg-accent/95",
        ghost: "hover:bg-secondary/10 text-foreground",
        link: "text-primary underline decoration-2 underline-offset-4 hover:opacity-85 no-shadow hover:shadow-none hover:-translate-y-0",
      },
      size: {
        xs: "h-8 px-4 text-xs",
        sm: "h-9 px-5 text-xs",
        default: "h-11 px-8",
        lg: "h-12 px-10 text-sm",
        xl: "h-14 px-12 text-base",
        icon: "h-10 w-10 rounded-full",
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
