import Link from "next/link";
import Image from "next/image";

import type { Service } from "@/lib/cms";
type ServiceCardsProps = {
  services: Service[];
};

const SERVICE_ICONS: Record<string, { icon: string; chip: string; chipText: string }> = {
  "MVP Launch System": { icon: "rocket_launch", chip: "bg-primary-fixed", chipText: "text-on-primary-fixed-variant" },
  "Business Automation Setup": { icon: "settings_input_component", chip: "bg-secondary-fixed", chipText: "text-on-secondary-fixed-variant" },
  "Conversion Website Setup": { icon: "web", chip: "bg-primary-fixed", chipText: "text-on-primary-fixed-variant" },
  "Content Growth System": { icon: "dynamic_feed", chip: "bg-secondary-fixed", chipText: "text-on-secondary-fixed-variant" },
};

function iconFor(name: string) {
  return SERVICE_ICONS[name] ?? { icon: "auto_awesome", chip: "bg-primary-fixed", chipText: "text-on-primary-fixed-variant" };
}

export function ServiceCards({ services }: ServiceCardsProps) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-6 py-section-gap lg:px-8 md:grid-cols-2">
      {services.map((service) => {
        const meta = iconFor(service.name);
        return (
          <article
            key={service.name}
            className="ambient-shadow flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg transition hover:border-primary-container"
          >
            <div className="mb-stack-lg flex items-start justify-between">
              <div className={`rounded-lg p-3 ${meta.chip}`}>
                <span className={`material-symbols-outlined ${meta.chipText}`} aria-hidden>
                  {meta.icon}
                </span>
              </div>
              {service.duration ? (
                <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-label-sm text-on-tertiary-fixed">
                  {service.duration}
                </span>
              ) : null}
            </div>

            <h3 className="text-headline-md mb-stack-sm">{service.name}</h3>
            <p className="mb-stack-lg text-tertiary">{service.description}</p>

            <div className="mb-stack-lg">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                Starting at
              </span>
              <div className="text-headline-md mb-1 font-bold">{service.price}</div>
            </div>

            <div className="mb-stack-lg flex-1 space-y-stack-md">
              <div>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-on-background">
                  What&apos;s included
                </span>
                <ul className="space-y-2">
                  {service.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-body-md">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }} aria-hidden>
                        check_circle
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href="/contact"
              className="rounded border border-on-background py-3 text-center text-label-bold text-on-background transition-colors hover:bg-on-background hover:text-white"
            >
              Start Project
            </Link>
          </article>
        );
      })}
    </section>
  );
}

export function ServicesBento({ services }: ServiceCardsProps) {
  // Bento layout used on landing page: first 3 services as small cards, last as full-width dark feature card
  const small = services.slice(0, 3);
  const feature = services[3];

  return (
    <section className="mx-auto max-w-7xl px-6 py-section-gap lg:px-8" id="services">
      <div className="mb-16 text-center">
        <h2 className="text-headline-lg mb-stack-md">Execution-Focused Services</h2>
        <p className="mx-auto max-w-2xl text-tertiary">
          We don&apos;t just consult; we build the infrastructure your business needs to scale efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {small.map((service, i) => {
          const meta = iconFor(service.name);
          const span = i === 0 ? "md:col-span-2" : "md:col-span-1";
          return (
            <Link
              key={service.name}
              href="/services"
              className={`group ambient-shadow flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg transition-colors hover:border-primary-container ${span}`}
            >
              <div>
                <span className="material-symbols-outlined mb-6 text-primary-container" style={{ fontSize: 36 }} aria-hidden>
                  {meta.icon}
                </span>
                <h3 className="text-headline-md mb-stack-md">{service.name}</h3>
                <p className="mb-stack-md text-tertiary">{service.description}</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-label-bold text-on-surface-variant">Starting at {service.price}</span>
                {i === 0 ? (
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-2" aria-hidden>
                    arrow_forward
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}

        {feature ? (
          <div className="relative overflow-hidden rounded-xl bg-zinc-900 p-stack-lg text-white md:col-span-4">
            <div className="relative z-10 flex flex-col items-center gap-12 md:flex-row">
              <div className="md:w-1/2">
                <span className="mb-stack-md inline-block rounded bg-primary-container px-3 py-1 text-label-sm text-on-primary-container">
                  POPULAR
                </span>
                <h3 className="text-headline-lg mb-stack-md">{feature.name}</h3>
                <p className="mb-8 text-zinc-400">{feature.description}</p>
                <Link
                  href="/services"
                  className="inline-flex rounded bg-surface-container-lowest px-6 py-3 text-label-bold text-zinc-900 transition-colors hover:bg-zinc-100"
                >
                  Explore Growth Systems
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="ambient-shadow sm:rotate-3 overflow-hidden rounded-lg shadow-2xl">
                  <div className="aspect-[16/10]">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgDm9nz3fnQ_0vhTmVkdV-39lsGZbwND6ah72GE4ISh4kcBXZimjpXSukY4L3PXzIT53blgHB_qiaqX0xuSiwO9wWwEcU39svmpj2yDRtu0jIp1zm82LgOVJqBb7yAlReO799iz4lgJmc5w2ZTgEv3baZcxvdCM4SFmIjjVPEQATZu1D4cnkshLKNoY73qR9H6hyyvcC_hFUFl3ieFWyrn3ETXALZN07CpbwId4oAdJGjXOqsKeQwXyBk1svkW2t4d8FnneIjuDfke"
                      alt="Growth analytics dashboard"
                      width={1200}
                      height={750}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
