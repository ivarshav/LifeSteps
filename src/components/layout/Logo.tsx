export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <rect fill="#3B6FF5" height="30" rx="9" width="30" x="1" y="1" />
      <path
        d="M7 22.5c0-3.6 1.4-5.6 3.6-5.6 1.9 0 3 1.4 3 3.6 0 2.4-1.2 4-3.2 4-2 0-3.4-.8-3.4-2zM9.2 13.4c0-2.4 1-3.9 2.6-3.9 1.4 0 2.3 1.1 2.3 2.7 0 1.8-1 3-2.4 3-1.5 0-2.5-.7-2.5-1.8z"
        fill="#fff"
        opacity=".55"
      />
      <path
        d="m17.5 17.6 3.1 3.2 6.2-8"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}
