import { ImageResponse } from "next/og";

export const alt = "צעדי חיים — כל צעד בחיים, עם רשימה שאפשר לסמן";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(145deg, #eef3ff, #ffffff)",
        color: "#111827",
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: "80px",
        textAlign: "center",
        width: "100%",
      }}
    >
      <div style={{ color: "#3b6ff5", display: "flex", fontSize: 42 }}>
        צעדי חיים
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          marginTop: 28,
        }}
      >
        כל צעד בחיים,
        <br />
        עם רשימה שאפשר לסמן
      </div>
    </div>,
    size,
  );
}
