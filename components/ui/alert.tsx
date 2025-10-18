import React from "react";
import type { LucideIcon } from "lucide-react";

type Variant = "danger" | "info" | "success" | "warning";

interface AlertProps {
  variant?: Variant;
  children: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | LucideIcon;
  className?: string;
}

const VARIANT_STYLES: Record<
  Variant,
  { container: string; title: string; description: string }
> = {
  danger: {
    container: "bg-red-50 text-red-800",
    title: "text-red-900",
    description: "text-red-700",
  },
  info: {
    container: "bg-blue-50 text-blue-800",
    title: "text-blue-900",
    description: "text-blue-700",
  },
  success: {
    container: "bg-green-50 text-green-800",
    title: "text-green-900",
    description: "text-green-700",
  },
  warning: {
    container: "bg-yellow-50 text-yellow-800",
    title: "text-yellow-900",
    description: "text-yellow-700",
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "danger",
  children,
  icon: Icon,
  className = "",
}) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      role="alert"
      className={`p-4 rounded-lg flex items-start gap-3 ${styles.container} ${className}`}
    >
      {Icon && (
        <div className="flex-shrink-0">
          {/* Icon can be a lucide-react component or a raw svg component */}
          <Icon
            className="w-5 h-5"
            aria-hidden="true"
            {...("size" in Icon ? { size: 20 } : {})}
          />
        </div>
      )}

      <div className="min-w-0">{children}</div>
    </div>
  );
};

interface TitleProps {
  children: React.ReactNode;
}

export const AlertTitle: React.FC<TitleProps> = ({ children }) => (
  <div className="font-semibold text-sm">{children}</div>
);

export const AlertDescription: React.FC<TitleProps> = ({ children }) => (
  <div className="text-sm mt-1 opacity-95">{children}</div>
);

export default Alert;
