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
      {/* Starfield fallback behind iframe */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          background: "radial-gradient(ellipse at 40% 30%, #0d1030 0%, #050810 50%, #020408 100%)",
        }}
      />

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

      {/* Cockpit frame — two beams converging inward */}
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
            <stop offset="0%" stop-color="#1a1d2e" />
            <stop offset="50%" stop-color="#0c0f1a" />
            <stop offset="100%" stop-color="#080a12" />
          </linearGradient>
        </defs>

        {/* Outer frame */}
        <rect x="0" y="0" width="1000" height="500" fill="url(#frameGrad)" />

        {/* Main viewport cutout — full rectangle */}
        <rect x="15" y="12" width="970" height="476" fill="black" fill-opacity="1" />
        {/* Re-fill the cutout with transparent to reveal iframe behind */}
        <rect x="15" y="12" width="970" height="476" fill="transparent" />

        {/* Left beam — angling from top-left inward to bottom-center */}
        <polygon
          points="200,12 230,12 420,488 390,488"
          fill="url(#frameGrad)"
        />
        {/* Right beam — angling from top-right inward to bottom-center */}
        <polygon
          points="770,12 800,12 610,488 580,488"
          fill="url(#frameGrad)"
        />

        {/* Beam edge highlights */}
        <line x1="215" y1="12" x2="405" y2="488" stroke="rgba(100, 160, 220, 0.15)" stroke-width="1.5" />
        <line x1="785" y1="12" x2="595" y2="488" stroke="rgba(100, 160, 220, 0.15)" stroke-width="1.5" />

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
            <circle cx={cx} cy={cy} r="2.5" fill="#0c0f1a" />
            <circle cx={cx} cy={cy} r="1" fill="rgba(100, 160, 220, 0.15)" />
          </>
        ))}

        {/* HULL INTEGRITY on top frame */}
        <text x="500" y="8" text-anchor="middle" font-family="var(--oc-font-mono)" font-size="7" fill="rgba(100, 160, 220, 0.2)" letter-spacing="3">
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
            "font-size": "8px",
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
