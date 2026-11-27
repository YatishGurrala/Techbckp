import { ImageResponse } from "next/og";

export const alt = "Techbckp — Build · Automate · Grow";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0f1115 0%, #1a1c1e 65%, #2b1a0d 100%)",
          color: "#f9f9f9",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#ff8400",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f1115",
              fontWeight: 800,
              fontSize: "24px",
            }}
          >
            T
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Techbckp
          </span>
          <span
            style={{
              marginLeft: "auto",
              padding: "8px 18px",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 132, 0, 0.45)",
              color: "#ffb784",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            BUILD · AUTOMATE · GROW
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px" }}>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Execution Partner for Founders &amp; Growing Businesses
          </div>
          <div style={{ fontSize: "26px", lineHeight: 1.4, color: "#b4b8bb" }}>
            MVPs, workflow automation, and conversion-focused web systems — shipped without hiring a full tech team.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "24px",
            fontSize: "20px",
            color: "#b4b8bb",
          }}
        >
          <span>www.techbckp.com</span>
          <span style={{ color: "#ff8400", fontWeight: 600 }}>Apps · Automation · Web Systems</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

