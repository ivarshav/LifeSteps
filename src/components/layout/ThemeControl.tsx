const toggleTheme = `(function(){var b=document.currentScript.previousElementSibling;b.addEventListener("click",function(){var n=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=n;try{localStorage.setItem("ls_theme",n)}catch(e){};window.dispatchEvent(new Event("ls-theme-change"))})})();`;

export function ThemeControl() {
  return (
    <>
      <button
        aria-label="החלפת מצב בהיר או כהה"
        className="grid size-[38px] place-items-center rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] text-[var(--gray-600)] transition-colors duration-200 hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]"
        title="מצב כהה / בהיר"
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="18"
          viewBox="0 0 24 24"
          width="18"
        >
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      <script dangerouslySetInnerHTML={{ __html: toggleTheme }} />
    </>
  );
}
