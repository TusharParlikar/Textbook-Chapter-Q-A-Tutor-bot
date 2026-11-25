/**
 * Margin logo.
 * An open book seen from above. Its spine is the stem of an "i";
 * the vermilion dot is the red-pen note written in the margin.
 */

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Margin"
    >
      <rect width="32" height="32" rx="8" fill="var(--logo-tile)" />
      <path
        d="M6.5 12.2c3.4-1.7 6.7-1.5 9.5.8v11.4c-2.8-2.1-6.1-2.3-9.5-.9V12.2Z"
        fill="var(--logo-page)"
      />
      <path
        d="M25.5 12.2c-3.4-1.7-6.7-1.5-9.5.8v11.4c2.8-2.1 6.1-2.3 9.5-.9V12.2Z"
        fill="var(--logo-page-shade)"
      />
      <circle cx="16" cy="7.4" r="2.3" fill="var(--logo-dot)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark size={34} />
      <span className="logo-words">
        <span className="logo-name">Margin</span>
        <span className="logo-tag">study · simulate · solve</span>
      </span>
    </span>
  );
}
