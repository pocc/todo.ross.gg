import { Component } from "solid-js"

export const SpaceViewport: Component = () => {
  // NASA ISS HD Earth Viewing — confirmed working stream
  const streamUrl = "https://www.youtube.com/embed/zPH5KtjJFaQ?autoplay=1&mute=1&showinfo=0&rel=0&controls=0&modestbranding=1&playsinline=1"

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
      {/* Starfield fallback behind iframe — animated subtle stars */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          background: "radial-gradient(ellipse at 40% 30%, #0d1030 0%, #050810 50%, #020408 100%)",
        }}
      >
        {/* Static star dots for when the stream doesn't load */}
        <svg
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0.8" }}
        >
          {/* Brighter stars */}
          <circle cx="45" cy="30" r="1.2" fill="rgba(200, 220, 255, 0.7)" />
          <circle cx="120" cy="55" r="0.8" fill="rgba(200, 220, 255, 0.5)" />
          <circle cx="200" cy="20" r="1.0" fill="rgba(200, 220, 255, 0.6)" />
          <circle cx="280" cy="70" r="0.9" fill="rgba(180, 200, 255, 0.5)" />
          <circle cx="350" cy="35" r="1.1" fill="rgba(200, 220, 255, 0.6)" />
          <circle cx="70" cy="120" r="0.7" fill="rgba(200, 220, 255, 0.4)" />
          <circle cx="160" cy="140" r="1.0" fill="rgba(200, 220, 255, 0.5)" />
          <circle cx="240" cy="160" r="0.8" fill="rgba(180, 200, 255, 0.4)" />
          <circle cx="310" cy="110" r="0.6" fill="rgba(200, 220, 255, 0.3)" />
          <circle cx="380" cy="150" r="0.9" fill="rgba(200, 220, 255, 0.5)" />
          {/* Dimmer stars */}
          <circle cx="30" cy="80" r="0.5" fill="rgba(160, 180, 220, 0.25)" />
          <circle cx="90" cy="170" r="0.4" fill="rgba(160, 180, 220, 0.2)" />
          <circle cx="145" cy="95" r="0.5" fill="rgba(160, 180, 220, 0.25)" />
          <circle cx="210" cy="110" r="0.4" fill="rgba(160, 180, 220, 0.2)" />
          <circle cx="260" cy="45" r="0.5" fill="rgba(160, 180, 220, 0.25)" />
          <circle cx="330" cy="85" r="0.4" fill="rgba(160, 180, 220, 0.2)" />
          <circle cx="375" cy="175" r="0.5" fill="rgba(160, 180, 220, 0.25)" />
          <circle cx="15" cy="150" r="0.4" fill="rgba(160, 180, 220, 0.2)" />
          {/* Faint nebula glow */}
          <circle cx="180" cy="80" r="40" fill="rgba(30, 50, 120, 0.08)" />
          <circle cx="300" cy="130" r="30" fill="rgba(60, 30, 80, 0.05)" />
        </svg>
      </div>

      {/* ISS live feed */}
      <iframe
        src={streamUrl}
        style={{
          position: "absolute",
          top: "-15%",
          left: "-5%",
          width: "110%",
          height: "130%",
          border: "none",
          "pointer-events": "none",
          "z-index": "1",
        }}
        allow="autoplay; encrypted-media"
        tabIndex={-1}
      />

      {/* Cockpit frame — curved windshield beams */}
      <svg
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          "pointer-events": "none",
          "z-index": "2",
        }}
      >
        <defs>
          <linearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--oc-cockpit-frame)" />
            <stop offset="50%" stop-color="var(--oc-cockpit-frame-end)" />
            <stop offset="100%" stop-color="var(--oc-cockpit-frame-dark)" />
          </linearGradient>
        </defs>

        {/* Outer frame */}
        <rect x="0" y="0" width="1000" height="500" fill="url(#frameGrad)" />

        {/* Main viewport cutout */}
        <rect x="15" y="12" width="970" height="476" fill="black" fill-opacity="1" />
        <rect x="15" y="12" width="970" height="476" fill="transparent" />

        {/* Left beam — curved arc from top-left inward to bottom-center */}
        <path
          d="M200,12 L230,12 Q380,250 420,488 L390,488 Q350,250 200,12 Z"
          fill="url(#frameGrad)"
        />
        {/* Right beam — curved arc from top-right inward to bottom-center */}
        <path
          d="M770,12 L800,12 Q650,250 610,488 L580,488 Q620,250 770,12 Z"
          fill="url(#frameGrad)"
        />

        {/* Beam edge highlights — curved */}
        <path d="M215,12 Q365,250 405,488" fill="none" stroke="rgba(100, 160, 220, 0.15)" stroke-width="1.5" />
        <path d="M785,12 Q635,250 595,488" fill="none" stroke="rgba(100, 160, 220, 0.15)" stroke-width="1.5" />

        {/* Frame border highlights */}
        <rect x="15" y="12" width="970" height="476" fill="none" stroke="rgba(80, 140, 200, 0.2)" stroke-width="2" />

        {/* Rivets at corners and beam joints */}
        {[
          [15, 12], [985, 12], [15, 488], [985, 488],
          [215, 12], [785, 12],
          [405, 488], [595, 488],
          [500, 8],
        ].map(([cx, cy]) => (
          <>
            <circle cx={cx} cy={cy} r="4" fill="#1a1f30" />
            <circle cx={cx} cy={cy} r="2.5" fill="var(--oc-cockpit-frame-end)" />
            <circle cx={cx} cy={cy} r="1" fill="rgba(100, 160, 220, 0.15)" />
          </>
        ))}

        {/* HULL INTEGRITY on top frame */}
        <text x="500" y="8" text-anchor="middle" font-family="var(--oc-font-mono)" font-size="8" fill="rgba(100, 160, 220, 0.25)" letter-spacing="3">
          HULL INTEGRITY 98.7%
        </text>
      </svg>

      {/* HUD overlays */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          "font-family": "var(--oc-font-mono)",
          "z-index": "3",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "4%",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.35)",
            "letter-spacing": "1.5px",
            "text-transform": "uppercase",
            "line-height": "1.8",
          }}
        >
          <div>SYS STATUS: NOMINAL</div>
          <div>NAV: CRUISING</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "4%",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.35)",
            "letter-spacing": "1.5px",
            "text-transform": "uppercase",
            "text-align": "right",
            "line-height": "1.8",
          }}
        >
          <div>SECTOR 7G-ROSS</div>
          <div>WARP 0.2c</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "6%",
            left: "50%",
            transform: "translateX(-50%)",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.2)",
            "letter-spacing": "2px",
          }}
        >
          FORWARD CAM 01 - LIVE
        </div>
      </div>

      {/* Scanline */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          "z-index": "4",
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
          "z-index": "4",
          "box-shadow": "inset 0 0 80px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  )
}
