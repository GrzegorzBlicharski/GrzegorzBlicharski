import type { AnchorHTMLAttributes, ReactNode } from "react";

/** next/link stand-in: a plain anchor; the global click handler routes internal hrefs. */
export default function Link({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
