import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
  subtitle?: string;
};

export const PageShell = ({
  title,
  subtitle,
  children,
}: PageShellProps): JSX.Element => (
  <main className="page-shell">
    <header className="page-header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
    {children}
  </main>
);
