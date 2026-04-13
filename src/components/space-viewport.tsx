import { Component } from "solid-js"

export const SpaceViewport: Component = () => {
  // ISS live stream from NASA — shows Earth from the space station
  const issStreamUrl = "https://www.youtube.com/embed/zPH5KtjJFaQ?autoplay=1&mute=1&showinfo=0&rel=0&controls=0&modestbranding=1&playsinline=1"

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#020408",
      }}
      aria-hidden="true"
    >
      {/* ISS live feed fills the viewport */}
      <iframe
        src={issStreamUrl}
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "110%",
          height: "120%",
          border: "none",
          "pointer-events": "none",
        }}
        allow="autoplay; encrypted-media"
        tabIndex={-1}
      />

      {/* Cockpit frame overlay — wide curved windshield shape */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          "pointer-events": "none",
        }}
      >
        <defs>
          {/* Gradient for the frame to give it depth */}
          <linearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1a1d2e" />
            <stop offset="40%" stop-color="#0c0f1a" />
            <stop offset="100%" stop-color="#080a12" />
          </linearGradient>
          {/* Subtle edge highlight */}
          <linearGradient id="edgeGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(100, 170, 255, 0.3)" />
            <stop offset="100%" stop-color="rgba(60, 120, 200, 0.05)" />
          </linearGradient>
        </defs>

        {/* Main frame with curved windshield cutout */}
        <path
          d={`
            M 0 0 H 1000 V 600 H 0 Z
            M 30 20
            Q 500 -30 970 20
            L 960 430
            Q 680 460 500 460
            Q 320 460 40 430
            Z
          `}
          fill="url(#frameGrad)"
          fill-rule="evenodd"
        />

        {/* Windshield edge highlight — top curve */}
        <path
          d="M 30 20 Q 500 -30 970 20"
          fill="none"
          stroke="rgba(100, 170, 255, 0.2)"
          stroke-width="2"
        />

        {/* Windshield edge highlight — bottom */}
        <path
          d="M 40 430 Q 320 460 500 460 Q 680 460 960 430"
          fill="none"
          stroke="rgba(100, 170, 255, 0.15)"
          stroke-width="2"
        />

        {/* Side edges */}
        <line x1="30" y1="20" x2="40" y2="430" stroke="rgba(100, 170, 255, 0.12)" stroke-width="1.5" />
        <line x1="970" y1="20" x2="960" y2="430" stroke="rgba(100, 170, 255, 0.12)" stroke-width="1.5" />

        {/* Center vertical strut — splits windshield subtly */}
        <line x1="500" y1="-25" x2="500" y2="460" stroke="rgba(80, 130, 200, 0.06)" stroke-width="3" />

        {/* Dashboard lip / console edge at bottom of windshield */}
        <rect x="0" y="440" width="1000" height="160" fill="url(#frameGrad)" />
        <line x1="0" y1="440" x2="1000" y2="440" stroke="rgba(100, 170, 255, 0.15)" stroke-width="1" />

        {/* Indicator lights along the dashboard edge */}
        {[
          { x: 80, color: "#4ade80" },
          { x: 140, color: "#4ade80" },
          { x: 200, color: "#facc15" },
          { x: 800, color: "#4ade80" },
          { x: 860, color: "#facc15" },
          { x: 920, color: "#ef4444" },
        ].map((light) => (
          <>
            <circle cx={light.x} cy={448} r="3" fill={light.color} opacity="0.7" />
            <circle cx={light.x} cy={448} r="6" fill={light.color} opacity="0.1" />
          </>
        ))}

        {/* Small screens / panels on the dashboard area */}
        {/* Left screen */}
        <rect x="60" y="465" width="120" height="70" rx="3" fill="#0a0d18" stroke="rgba(60, 130, 200, 0.2)" stroke-width="1" />
        <text x="120" y="480" text-anchor="middle" font-family="var(--oc-font-mono)" font-size="6" fill="rgba(100, 200, 255, 0.3)" letter-spacing="1">NAV SYSTEM</text>
        {/* Fake nav display lines */}
        <line x1="75" y1="490" x2="165" y2="490" stroke="rgba(60, 180, 255, 0.15)" stroke-width="0.5" />
        <line x1="75" y1="500" x2="140" y2="500" stroke="rgba(60, 180, 255, 0.1)" stroke-width="0.5" />
        <line x1="75" y1="510" x2="155" y2="510" stroke="rgba(60, 180, 255, 0.12)" stroke-width="0.5" />
        <circle cx="120" cy="505" r="10" fill="none" stroke="rgba(60, 180, 255, 0.1)" stroke-width="0.5" />

        {/* Right screen */}
        <rect x="820" y="465" width="120" height="70" rx="3" fill="#0a0d18" stroke="rgba(60, 130, 200, 0.2)" stroke-width="1" />
        <text x="880" y="480" text-anchor="middle" font-family="var(--oc-font-mono)" font-size="6" fill="rgba(100, 200, 255, 0.3)" letter-spacing="1">AUX CONTROL</text>
        <line x1="835" y1="490" x2="925" y2="490" stroke="rgba(60, 180, 255, 0.15)" stroke-width="0.5" />
        <line x1="835" y1="500" x2="900" y2="500" stroke="rgba(60, 180, 255, 0.1)" stroke-width="0.5" />
        <line x1="835" y1="510" x2="910" y2="510" stroke="rgba(60, 180, 255, 0.12)" stroke-width="0.5" />

        {/* Center instrument cluster hint */}
        <rect x="420" y="470" width="160" height="55" rx="3" fill="#0a0d18" stroke="rgba(200, 80, 80, 0.15)" stroke-width="1" />
        {/* Red button grid */}
        {[0, 1, 2, 3, 4].map((i) =>
          [0, 1, 2].map((j) => (
            <rect
              x={440 + i * 25}
              y={482 + j * 14}
              width="15"
              height="8"
              rx="1"
              fill={`rgba(200, 60, 60, ${0.15 + Math.random() * 0.2})`}
            />
          ))
        )}

        {/* Rivet dots at frame corners */}
        {[
          [30, 20], [970, 20], [40, 430], [960, 430],
          [250, 5], [750, 5], [250, 445], [750, 445],
        ].map(([cx, cy]) => (
          <>
            <circle cx={cx} cy={cy} r="3.5" fill="#1a1f30" />
            <circle cx={cx} cy={cy} r="2" fill="#0c0f1a" />
            <circle cx={cx} cy={cy} r="1" fill="rgba(100, 160, 220, 0.12)" />
          </>
        ))}

        {/* HULL INTEGRITY label on roof */}
        <text
          x="500" y="12"
          text-anchor="middle"
          font-family="var(--oc-font-mono)"
          font-size="8"
          fill="rgba(100, 160, 220, 0.18)"
          letter-spacing="3"
        >
          HULL INTEGRITY 98.7%
        </text>
      </svg>

      {/* HUD text overlays positioned inside the windshield */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          "font-family": "var(--oc-font-mono)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "8%",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.4)",
            "letter-spacing": "1.5px",
            "text-transform": "uppercase",
            "line-height": "1.8",
          }}
        >
          <div>SYS STATUS: NOMINAL</div>
          <div>NAV: CRUISING</div>
          <div style={{ "margin-top": "4px", "font-size": "8px", color: "rgba(100, 180, 255, 0.25)" }}>
            FORWARD CAM 01 - LIVE
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "8%",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.4)",
            "letter-spacing": "1.5px",
            "text-transform": "uppercase",
            "text-align": "right",
            "line-height": "1.8",
          }}
        >
          <div>SECTOR 7G-ROSS</div>
          <div>WARP 0.2c</div>
        </div>

        {/* Crosshair / targeting reticle in center */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="15" fill="none" stroke="rgba(100, 180, 255, 0.1)" stroke-width="0.5" />
            <circle cx="30" cy="30" r="2" fill="none" stroke="rgba(100, 180, 255, 0.15)" stroke-width="0.5" />
            <line x1="15" y1="30" x2="25" y2="30" stroke="rgba(100, 180, 255, 0.1)" stroke-width="0.5" />
            <line x1="35" y1="30" x2="45" y2="30" stroke="rgba(100, 180, 255, 0.1)" stroke-width="0.5" />
            <line x1="30" y1="15" x2="30" y2="25" stroke="rgba(100, 180, 255, 0.1)" stroke-width="0.5" />
            <line x1="30" y1="35" x2="30" y2="45" stroke="rgba(100, 180, 255, 0.1)" stroke-width="0.5" />
          </svg>
        </div>
      </div>

      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px)",
          opacity: "0.4",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          "box-shadow": "inset 0 0 120px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  )
}
