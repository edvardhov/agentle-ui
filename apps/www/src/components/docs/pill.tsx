interface PillProps {
  children: string;
  variant?: "default" | "success" | "muted";
}

export function Pill({ children, variant = "default" }: PillProps) {
  return <span className={`pill pill--${variant}`}>{children}</span>;
}
