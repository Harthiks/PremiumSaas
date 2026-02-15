import { forwardRef, ButtonHTMLAttributes, ReactElement, cloneElement, isValidElement } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const buttonClass = (
  variant: ButtonProps["variant"],
  size: ButtonProps["size"],
  className: string
) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-6 text-base",
  };
  return `${base} ${variants[variant ?? "default"]} ${sizes[size ?? "default"]} ${className}`;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      disabled,
      asChild,
      children,
      ...props
    },
    ref
  ) => {
    const classes = buttonClass(variant, size, className);
    if (asChild && isValidElement(children) && (children as ReactElement).type) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: [classes, (children as ReactElement<{ className?: string }>).props.className].filter(Boolean).join(" "),
      });
    }
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
