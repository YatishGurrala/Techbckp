import Image from "next/image";

type LogoLockupProps = {
  mode?: "light" | "dark" | "auto";
  className?: string;
  textClassName?: string;
};

export function LogoLockup({ mode = "auto", className = "", textClassName }: LogoLockupProps) {
  const isAuto = mode === "auto";
  const src = mode === "dark" ? "/bkp_Orange.png" : "/bkp_Black.png";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8">
        {isAuto ? (
          <>
            <Image
              src="/bkp_Black.png"
              alt="Techbckp logo"
              fill
              sizes="32px"
              className="logo-auto-light object-contain"
              priority
            />
            <Image
              src="/bkp_Orange.png"
              alt="Techbckp logo"
              fill
              sizes="32px"
              className="logo-auto-dark object-contain"
              priority
            />
          </>
        ) : (
          <Image src={src} alt="Techbckp logo" fill sizes="32px" className="object-contain" priority />
        )}
      </div>

      <span
        className={
          textClassName ??
          "text-xl font-bold tracking-tight text-on-surface dark:text-white"
        }
      >
        Techbckp
      </span>
    </div>
  );
}
