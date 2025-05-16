import { twMerge } from "tailwind-merge";

const clickableClass = "pointer-events-auto cursor-pointer";

type Props = {
  children: string;
  onClick: () => void;
  title: string;
  className?: string | false;
  disabled?: boolean;
  notAllowed?: boolean;
};

export default function Button({
  children,
  onClick,
  title,
  className,
  disabled,
  notAllowed,
}: Props) {
  const kebabCaseName = title.replace(" ", "-");
  return (
    <button
      className={twMerge(
        clickableClass,
        "hover:text-red-500",
        !!notAllowed ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-describedby={kebabCaseName}
      id={kebabCaseName}
      type="button"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      onMouseEnter={() => {
        const tooltip = document.getElementById(kebabCaseName);
        if (tooltip) {
          tooltip.setAttribute("role", "tooltip");
        }
      }}
      onMouseLeave={() => {
        const tooltip = document.getElementById(kebabCaseName);
        if (tooltip) {
          tooltip.setAttribute("role", "tooltip");
        }
      }}
    >
      {children}
    </button>
  );
}
