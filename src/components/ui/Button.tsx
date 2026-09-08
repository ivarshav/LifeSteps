import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useLayoutEffect,
  useState,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonVisualProps = {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVisualProps & {
    asChild?: false;
  };

type SlotChildProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  ref?: Ref<HTMLElement>;
};

type SlottedButtonProps = HTMLAttributes<HTMLElement> &
  ButtonVisualProps & {
    asChild: true;
    children: ReactElement<SlotChildProps>;
    disabled?: boolean;
  };

type ButtonProps = NativeButtonProps | SlottedButtonProps;

const variants: Record<ButtonVariant, string> = {
  primary:
    "ui-button-primary border-transparent bg-[var(--brand-500)] shadow-[var(--shadow-sm)] hover:bg-[var(--brand-600)]",
  secondary:
    "border-[var(--gray-200)] bg-[var(--surface)] text-[var(--brand-600)] shadow-[var(--shadow-sm)] hover:border-[var(--brand-200)] hover:bg-[var(--brand-50)]",
  ghost:
    "border-transparent bg-transparent text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]",
  danger:
    "border-transparent bg-[var(--danger-500)] text-white hover:brightness-[.93]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "rounded-[var(--radius-sm)] px-3 py-1.5 text-[.8125rem]",
  md: "rounded-[var(--radius-md)] px-[18px] py-2.5 text-[.9375rem]",
};

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function getClasses({
  className,
  size = "md",
  variant = "primary",
}: ButtonVisualProps & { className?: string }) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-semibold no-underline transition-[background,color,border-color,box-shadow,transform,filter] duration-200 ease-out hover:-translate-y-px hover:no-underline active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:translate-y-0",
    variants[variant],
    sizes[size],
    className,
  );
}

function ButtonImpl(props: ButtonProps, ref: ForwardedRef<HTMLElement>) {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setRef(ref, node);
    return () => setRef(ref, null);
  }, [node, ref]);

  if (props.asChild) {
    const {
      asChild: _asChild,
      children,
      className,
      disabled = false,
      onClick,
      onKeyDown,
      size = "md",
      style,
      variant = "primary",
      ...attributes
    } = props;
    void _asChild;
    const child = Children.only(children);
    if (!isValidElement<SlotChildProps>(child)) {
      throw new TypeError("Button with asChild requires one React element.");
    }

    const handleClick = (event: MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      child.props.onClick?.(event);
      if (!event.defaultPrevented) {
        onClick?.(event);
      }
    };

    const handleKeyDown: HTMLAttributes<HTMLElement>["onKeyDown"] = (event) => {
      if (disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      child.props.onKeyDown?.(event);
      if (!event.defaultPrevented) {
        onKeyDown?.(event);
      }
    };

    return cloneElement(child, {
      ...attributes,
      "aria-disabled": disabled || undefined,
      className: cn(
        getClasses({ className, size, variant }),
        child.props.className,
      ),
      href: disabled ? undefined : child.props.href,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      ref: setNode,
      role:
        disabled && child.props.href
          ? (child.props.role ?? "link")
          : child.props.role,
      style: { ...style, ...child.props.style },
      tabIndex: disabled ? 0 : child.props.tabIndex,
    });
  }

  const {
    asChild: _asChild,
    children,
    className,
    size = "md",
    type = "button",
    variant = "primary",
    ...buttonProps
  } = props;
  void _asChild;

  return (
    <button
      ref={setNode}
      className={getClasses({ className, size, variant })}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

export const Button = forwardRef<HTMLElement, ButtonProps>(
  function Button(props, ref) {
    return ButtonImpl(props, ref);
  },
);
