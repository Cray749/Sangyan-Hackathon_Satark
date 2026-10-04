// The Satark mark: a pause sign inside a ring. "Pause before you pay."
export function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="17" fill="#c4301c" stroke="#1b1915" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#f3ead8" strokeWidth="1.2" strokeDasharray="2.4 2.4" />
      <rect x="13.5" y="12" width="4.6" height="16" rx="1" fill="#f3ead8" />
      <rect x="21.9" y="12" width="4.6" height="16" rx="1" fill="#f3ead8" />
    </svg>
  );
}
