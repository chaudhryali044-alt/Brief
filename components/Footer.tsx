export default function Footer({ fixed = false }: { fixed?: boolean }) {
  const positionClass = fixed ? "fixed bottom-0 left-0 right-0" : "w-full";
  return (
    <footer className={`${positionClass} bg-surface-container-lowest border-t border-outline-variant`}>
      <div className="w-full py-gutter px-margin-desktop flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <span className="font-headline-lg text-on-surface-variant">Brief</span>
          <p className="font-body-md text-on-tertiary-fixed-variant text-xs">
            © 2024 Brief Financial Intelligence. Proprietary &amp; Confidential.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-on-surface transition-colors" href="#">
            Terms of Service
          </a>
          <a className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-on-surface transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-on-surface transition-colors" href="#">
            Institutional Access
          </a>
          <a className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-on-surface transition-colors" href="#">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
