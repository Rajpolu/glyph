import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Untitled Snippet";
    const code = searchParams.get("code") || "// No code provided";
    const lang = searchParams.get("lang") || "typescript";

    // Take first 18 lines for display
    const lines = code.split("\n").slice(0, 18);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0d0d14 0%, #13101e 100%)",
            padding: "48px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Top-left: Glyph brand */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              marginBottom: "32px",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "28px",
                letterSpacing: "-0.03em",
              }}
            >
              Glyph
            </span>
            <span
              style={{
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              Code into art
            </span>
          </div>

          {/* Center: Code window card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              background: "#1a1b26",
              borderRadius: "16px",
              padding: "32px",
              overflow: "hidden",
            }}
          >
            {/* Window dots + title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ff5f56",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ffbd2e",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#27c93f",
                }}
              />
              <span
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  marginLeft: "12px",
                }}
              >
                {title}
              </span>
              <span
                style={{
                  color: "#334155",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  marginLeft: "auto",
                }}
              >
                {lang}
              </span>
            </div>

            {/* Code lines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#334155",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      minWidth: "28px",
                      textAlign: "right",
                      marginRight: "16px",
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      whiteSpace: "pre",
                      overflow: "hidden",
                    }}
                  >
                    {line || " "}
                  </span>
                </div>
              ))}
              {lines.length >= 18 && (
                <div
                  style={{
                    color: "#475569",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    marginTop: "4px",
                    marginLeft: "44px",
                  }}
                >
                  ...
                </div>
              )}
            </div>
          </div>

          {/* Bottom-right: attribution */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <span
              style={{
                color: "#334155",
                fontSize: "13px",
                letterSpacing: "0.04em",
              }}
            >
              Made with Glyph
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error("OG image generation error:", err);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
