"use client";

import { track } from "@vercel/analytics";

/** Plain external/affiliate anchor that fires a Vercel Analytics event on click. */
export default function TrackedLink({
  event,
  data,
  className,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  data?: Record<string, string | number | boolean>;
}) {
  return (
    <a {...rest} className={className} onClick={() => track(event, data)}>
      {children}
    </a>
  );
}
