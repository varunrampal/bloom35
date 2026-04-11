import { ImageResponse } from "next/og";

export const alt = "Bloom35 perimenopause support preview";
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
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #fbf4ed 0%, #f7efe6 55%, #fffaf6 100%)",
          color: "#2e2230",
          padding: "56px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "72px",
            top: "56px",
            width: "240px",
            height: "240px",
            borderRadius: "999px",
            background: "rgba(212, 227, 218, 0.85)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-60px",
            bottom: "-40px",
            width: "260px",
            height: "260px",
            borderRadius: "999px",
            background: "rgba(248, 211, 197, 0.82)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: "36px",
            border: "1px solid rgba(109, 90, 107, 0.16)",
            background: "rgba(255, 251, 247, 0.78)",
            padding: "56px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "68px",
                height: "68px",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, #d97252 0%, #f0b39f 100%)",
                color: "white",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              B
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                letterSpacing: "-0.04em",
              }}
            >
              Bloom35
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "780px",
            }}
          >
            <div
              style={{
                display: "flex",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "20px",
                color: "#6d5a6b",
              }}
            >
              Perimenopause support
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "68px",
                lineHeight: 1,
                letterSpacing: "-0.05em",
              }}
            >
              Practical guides, tools, and comfort-first product picks.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                lineHeight: 1.35,
                color: "#4f4251",
              }}
            >
              Symptom support for sleep issues, hot flashes, mood changes, and
              brain fog.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
