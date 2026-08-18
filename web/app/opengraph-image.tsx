import { ImageResponse } from "next/og";
import { SKILLS_ROUNDED, STATS } from "@/lib/constants";

export const alt = `skills-mcp — ${SKILLS_ROUNDED} agent skills. One MCP server.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors assets/social-preview.png in the skills-mcp repo so a link to the
// site and a link to the repo unfurl as the same card.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0D1117",
          padding: "76px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#7EE787",
            }}
          />
          <div style={{ fontSize: 26, color: "#8B949E" }}>skills-mcp</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: "#E6EDF3",
              letterSpacing: -2,
            }}
          >
            {`${SKILLS_ROUNDED} agent skills.`}
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: "#7EE787",
              letterSpacing: -2,
            }}
          >
            One MCP server.
          </div>
          {/* Satori requires exactly one text child unless display is set. */}
          <div style={{ marginTop: 28, fontSize: 27, color: "#8B949E" }}>
            {`Search, preview and install agent skills from ${STATS.repos} source repos —`}
          </div>
          <div style={{ fontSize: 27, color: "#8B949E" }}>
            in Cursor, Claude Code, Cline, Windsurf, or any MCP client.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "12px 20px",
              borderRadius: 10,
              border: "1px solid #30363D",
              background: "#161B22",
              fontSize: 22,
              color: "#79C0FF",
            }}
          >
            npx @gengirish/skills-mcp
          </div>
          <div style={{ fontSize: 21, color: "#6E7681" }}>
            github.com/gengirish/skills-mcp
          </div>
        </div>
      </div>
    ),
    size
  );
}
