import type { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type Width = "default" | "wide" | "narrow";

type PageContainerProps<T extends ElementType> = PropsWithChildren<{
  as?: T;
  width?: Width;
  className?: string;
}> & Omit<ComponentPropsWithoutRef<T>, "as" | "width" | "className" | "children">;

const widthClassMap: Record<Width, string> = {
  default: "page-container",
  wide: "page-container-wide",
  narrow: "page-container-narrow",
};

export default function PageContainer<T extends ElementType = "div">({
  as,
  width = "default",
  className,
  children,
  ...rest
}: PageContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component className={cn(widthClassMap[width], className)} {...rest}>
      {children}
    </Component>
  );
}
