interface ReplayButtonProps {
  onClick: () => void;
  label?: string;
}

export function ReplayButton({ onClick, label = "Replay" }: ReplayButtonProps) {
  return (
    <button type="button" className="btn btn--demo" onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="btn__icon">
        <path
          d="M3 12a9 9 0 0 1 15.3-6.36M21 12a9 9 0 0 1-15.3 6.36"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M17 3h4v4M3 21v-4h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
