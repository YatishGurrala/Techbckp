"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  trackClientEvent,
  type ClientAnalyticsEventName,
  type ClientAnalyticsParams,
} from "@/lib/client-analytics";

type TrackedLinkProps = {
  href: string;
  eventName: ClientAnalyticsEventName;
  eventParams?: ClientAnalyticsParams;
  className?: string;
  children: ReactNode;
  external?: boolean;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export function TrackedLink({
  href,
  eventName,
  eventParams,
  className,
  children,
  external,
  target,
  rel,
  onClick,
}: TrackedLinkProps) {
  const isExternal =
    external ?? (/^(https?:|mailto:|tel:)/i.test(href));

  const handleClick = () => {
    trackClientEvent(eventName, eventParams);
    onClick?.();
  };

  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

