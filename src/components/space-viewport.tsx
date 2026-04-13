import { Component, onMount, onCleanup } from "solid-js"

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
}

interface CelestialBody {
  x: number
  y: number
  vx: number
  size: number
  type: "planet" | "moon" | "comet"
  color: string
  ringColor?: string
  hasRing: boolean
  ringTilt: number
  phase: number
  cometTailLength?: number
  cometAngle?: number
}

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export const SpaceViewport: Component = () => {
  let canvasRef: HTMLCanvasElement | undefined
  let animFrame: number
  let stars: Star[] = []
  let bodies: CelestialBody[] = []
  let time = 0
  let alive = true

  const STAR_COUNT = 200
  const STAR_DRIFT = 0.08
  const BODY_MIN_INTERVAL = 12000
  const BODY_MAX_INTERVAL = 22000

  function initStars(w: number, h: number) {
    stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        size: 0.5 + Math.random() * 1.8,
        brightness: 0.3 + Math.random() * 0.7,
      })
    }
  }

  function spawnBody(w: number, h: number): CelestialBody {
    const types: CelestialBody["type"][] = ["planet", "planet", "planet", "moon", "moon", "comet"]
    const type = types[Math.floor(Math.random() * types.length)]

    const planetHues = [
      { h: 25, s: 50, l: 55 },
      { h: 210, s: 45, l: 50 },
      { h: 15, s: 55, l: 45 },
      { h: 45, s: 40, l: 60 },
      { h: 280, s: 30, l: 45 },
      { h: 160, s: 35, l: 40 },
      { h: 340, s: 40, l: 50 },
    ]

    const ringHues = [
      { h: 40, s: 35, l: 65 },
      { h: 200, s: 30, l: 60 },
      { h: 20, s: 40, l: 55 },
      { h: 280, s: 25, l: 60 },
    ]

    const col = planetHues[Math.floor(Math.random() * planetHues.length)]
    const rCol = ringHues[Math.floor(Math.random() * ringHues.length)]

    if (type === "planet") {
      const size = randomBetween(40, 120)
      return {
        x: w + size + 50,
        y: randomBetween(h * 0.1, h * 0.75),
        vx: randomBetween(0.15, 0.4),
        size,
        type: "planet",
        color: hsl(col.h, col.s, col.l),
        hasRing: Math.random() > 0.35,
        ringColor: hsl(rCol.h, rCol.s, rCol.l, 0.5),
        ringTilt: randomBetween(0.15, 0.45),
        phase: Math.random() * Math.PI * 2,
      }
    }

    if (type === "moon") {
      const size = randomBetween(12, 30)
      return {
        x: w + size + 30,
        y: randomBetween(h * 0.15, h * 0.8),
        vx: randomBetween(0.25, 0.55),
        size,
        type: "moon",
        color: hsl(0, 0, randomBetween(55, 75)),
        hasRing: false,
        ringTilt: 0,
        phase: Math.random() * Math.PI * 2,
      }
    }

    const angle = randomBetween(-0.3, 0.3)
    return {
      x: w + 40,
      y: randomBetween(h * 0.05, h * 0.7),
      vx: randomBetween(0.5, 0.9),
      size: randomBetween(3, 7),
      type: "comet",
      color: hsl(190, 70, 80),
      hasRing: false,
      ringTilt: 0,
      phase: 0,
      cometTailLength: randomBetween(80, 200),
      cometAngle: angle,
    }
  }

  function drawStar(ctx: CanvasRenderingContext2D, star: Star, t: number) {
    const twinkle = 0.6 + 0.4 * Math.sin(t * 0.001 + star.z * 100)
    const alpha = star.brightness * twinkle
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`
    ctx.fill()

    if (star.size > 1.2) {
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200, 215, 255, ${alpha * 0.1})`
      ctx.fill()
    }
  }

  function drawPlanet(ctx: CanvasRenderingContext2D, body: CelestialBody, t: number) {
    const { x, y, size, color, hasRing, ringColor, ringTilt } = body

    const grad = ctx.createRadialGradient(
      x - size * 0.25, y - size * 0.2, size * 0.1,
      x, y, size
    )
    grad.addColorStop(0, color)
    grad.addColorStop(0.7, color)
    grad.addColorStop(1, "rgba(0,0,0,0.7)")

    if (hasRing && ringColor) drawRing(ctx, x, y, size, ringTilt, ringColor, false)

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    const glowGrad = ctx.createRadialGradient(x, y, size * 0.9, x, y, size * 1.3)
    glowGrad.addColorStop(0, "rgba(150, 180, 255, 0)")
    glowGrad.addColorStop(0.5, "rgba(150, 180, 255, 0.04)")
    glowGrad.addColorStop(1, "rgba(150, 180, 255, 0)")
    ctx.beginPath()
    ctx.arc(x, y, size * 1.3, 0, Math.PI * 2)
    ctx.fillStyle = glowGrad
    ctx.fill()

    if (hasRing && ringColor) drawRing(ctx, x, y, size, ringTilt, ringColor, true)
  }

  function drawRing(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, planetSize: number,
    tilt: number, color: string, front: boolean
  ) {
    ctx.save()
    ctx.translate(x, y)
    const innerRadius = planetSize * 1.3
    const outerRadius = planetSize * 1.9
    ctx.scale(1, tilt)

    if (front) {
      ctx.beginPath()
      ctx.ellipse(0, 0, outerRadius, outerRadius, 0, 0, Math.PI)
      ctx.ellipse(0, 0, innerRadius, innerRadius, 0, Math.PI, 0)
      ctx.closePath()
    } else {
      ctx.beginPath()
      ctx.ellipse(0, 0, outerRadius, outerRadius, 0, Math.PI, Math.PI * 2)
      ctx.ellipse(0, 0, innerRadius, innerRadius, 0, 0, -Math.PI)
      ctx.closePath()
    }

    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
  }

  function drawMoon(ctx: CanvasRenderingContext2D, body: CelestialBody) {
    const { x, y, size, color } = body

    const grad = ctx.createRadialGradient(
      x - size * 0.3, y - size * 0.3, size * 0.05,
      x, y, size
    )
    grad.addColorStop(0, color)
    grad.addColorStop(1, "rgba(40,40,50,0.9)")

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    ctx.globalAlpha = 0.12
    const craterCount = Math.floor(size / 6)
    for (let i = 0; i < craterCount; i++) {
      const angle = (i / craterCount) * Math.PI * 2 + body.phase
      const dist = size * 0.4 * ((i % 3 + 1) / 3)
      const cx = x + Math.cos(angle) * dist
      const cy = y + Math.sin(angle) * dist
      const cr = size * randomBetween(0.1, 0.2)
      ctx.beginPath()
      ctx.arc(cx, cy, cr, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.5)"
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  function drawComet(ctx: CanvasRenderingContext2D, body: CelestialBody) {
    const { x, y, size, cometTailLength = 120, cometAngle = 0 } = body

    const tailGrad = ctx.createLinearGradient(
      x, y,
      x + cometTailLength, y + cometTailLength * Math.sin(cometAngle)
    )
    tailGrad.addColorStop(0, "rgba(180, 220, 255, 0.5)")
    tailGrad.addColorStop(0.3, "rgba(150, 200, 255, 0.2)")
    tailGrad.addColorStop(1, "rgba(150, 200, 255, 0)")

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.5)
    ctx.quadraticCurveTo(
      x + cometTailLength * 0.5, y + cometTailLength * Math.sin(cometAngle) * 0.5,
      x + cometTailLength, y + cometTailLength * Math.sin(cometAngle)
    )
    ctx.quadraticCurveTo(
      x + cometTailLength * 0.5, y + cometTailLength * Math.sin(cometAngle) * 0.5,
      x, y + size * 0.5
    )
    ctx.closePath()
    ctx.fillStyle = tailGrad
    ctx.fill()
    ctx.restore()

    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 5)
    glowGrad.addColorStop(0, "rgba(200, 230, 255, 0.6)")
    glowGrad.addColorStop(0.3, "rgba(180, 220, 255, 0.15)")
    glowGrad.addColorStop(1, "rgba(180, 220, 255, 0)")
    ctx.beginPath()
    ctx.arc(x, y, size * 5, 0, Math.PI * 2)
    ctx.fillStyle = glowGrad
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(230, 245, 255, 0.95)"
    ctx.fill()
  }

  function drawNebula(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const patches = [
      { cx: w * 0.2, cy: h * 0.3, r: 250, hue: 240, drift: 0.0002 },
      { cx: w * 0.8, cy: h * 0.6, r: 200, hue: 280, drift: 0.00015 },
      { cx: w * 0.5, cy: h * 0.8, r: 300, hue: 200, drift: 0.00025 },
    ]

    for (const p of patches) {
      const ox = Math.sin(t * p.drift) * 30
      const oy = Math.cos(t * p.drift * 0.7) * 20
      const grad = ctx.createRadialGradient(
        p.cx + ox, p.cy + oy, 0,
        p.cx + ox, p.cy + oy, p.r
      )
      grad.addColorStop(0, `hsla(${p.hue}, 60%, 30%, 0.04)`)
      grad.addColorStop(0.5, `hsla(${p.hue}, 40%, 20%, 0.02)`)
      grad.addColorStop(1, `hsla(${p.hue}, 30%, 15%, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }
  }

  function render() {
    const canvas = canvasRef
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    time++

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
    bgGrad.addColorStop(0, "#05060f")
    bgGrad.addColorStop(0.5, "#080a18")
    bgGrad.addColorStop(1, "#04050c")
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    drawNebula(ctx, w, h, time)

    for (const star of stars) {
      star.x -= STAR_DRIFT * (0.3 + star.z * 0.7)
      if (star.x < -5) {
        star.x = w + 5
        star.y = Math.random() * h
      }
      drawStar(ctx, star, time)
    }

    for (let i = bodies.length - 1; i >= 0; i--) {
      const body = bodies[i]
      body.x -= body.vx

      if (body.type === "planet") drawPlanet(ctx, body, time)
      else if (body.type === "moon") drawMoon(ctx, body)
      else if (body.type === "comet") drawComet(ctx, body)

      const margin = body.type === "planet" ? body.size * 2.5 : body.size * 6
      if (body.x < -margin) {
        bodies.splice(i, 1)
      }
    }

    animFrame = requestAnimationFrame(render)
  }

  function scheduleNextBody(w: number, h: number) {
    const delay = randomBetween(BODY_MIN_INTERVAL, BODY_MAX_INTERVAL)
    setTimeout(() => {
      if (!alive) return
      bodies.push(spawnBody(w, h))
      scheduleNextBody(w, h)
    }, delay)
  }

  onMount(() => {
    const canvas = canvasRef!
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    initStars(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    const logicalW = canvas.width / window.devicePixelRatio
    const logicalH = canvas.height / window.devicePixelRatio

    setTimeout(() => {
      if (!alive) return
      bodies.push(spawnBody(logicalW, logicalH))
    }, 3000)

    scheduleNextBody(logicalW, logicalH)
    animFrame = requestAnimationFrame(render)
    window.addEventListener("resize", resize)

    onCleanup(() => {
      alive = false
      cancelAnimationFrame(animFrame)
      window.removeEventListener("resize", resize)
    })
  })

  // Cockpit frame as SVG overlay with 3 viewport cutouts
  // Coordinates are in percentages mapped to viewBox 0 0 1000 600
  const framePath = `
    M 0 0 H 1000 V 600 H 0 Z
    M 60 50 L 320 80 L 350 400 L 40 350 Z
    M 370 30 L 630 30 L 680 400 L 320 400 Z
    M 680 80 L 940 50 L 960 350 L 650 400 Z
  `

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#05060f",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Cockpit frame overlay */}
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
        {/* Main frame — dark hull with viewport cutouts */}
        <path
          d={framePath}
          fill="#0c0f1a"
          fill-rule="evenodd"
        />

        {/* Viewport edge highlights — subtle glow along window frames */}
        {/* Left viewport */}
        <polygon
          points="60,50 320,80 350,400 40,350"
          fill="none"
          stroke="rgba(80, 140, 200, 0.2)"
          stroke-width="2"
        />
        {/* Center viewport */}
        <polygon
          points="370,30 630,30 680,400 320,400"
          fill="none"
          stroke="rgba(80, 140, 200, 0.25)"
          stroke-width="2.5"
        />
        {/* Right viewport */}
        <polygon
          points="680,80 940,50 960,350 650,400"
          fill="none"
          stroke="rgba(80, 140, 200, 0.2)"
          stroke-width="2"
        />

        {/* Structural beam highlights — bright edges on the frame dividers */}
        <line x1="320" y1="80" x2="320" y2="400" stroke="rgba(100, 160, 220, 0.12)" stroke-width="1" />
        <line x1="350" y1="400" x2="320" y2="400" stroke="rgba(100, 160, 220, 0.1)" stroke-width="1" />
        <line x1="680" y1="80" x2="650" y2="400" stroke="rgba(100, 160, 220, 0.12)" stroke-width="1" />
        <line x1="680" y1="400" x2="650" y2="400" stroke="rgba(100, 160, 220, 0.1)" stroke-width="1" />

        {/* Rivet/bolt dots at beam intersections */}
        {[
          [60, 50], [320, 80], [350, 400], [40, 350],
          [370, 30], [630, 30], [680, 400], [320, 400],
          [680, 80], [940, 50], [960, 350], [650, 400],
        ].map(([cx, cy]) => (
          <>
            <circle cx={cx} cy={cy} r="4" fill="#1a1f30" />
            <circle cx={cx} cy={cy} r="2.5" fill="#0c0f1a" />
            <circle cx={cx} cy={cy} r="1.2" fill="rgba(100, 160, 220, 0.15)" />
          </>
        ))}

        {/* Roof label */}
        <text
          x="500" y="20"
          text-anchor="middle"
          font-family="var(--oc-font-mono)"
          font-size="9"
          fill="rgba(100, 160, 220, 0.2)"
          letter-spacing="3"
        >
          HULL INTEGRITY 98.7%
        </text>
      </svg>

      {/* HUD text overlays positioned inside viewport panes */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          "font-family": "var(--oc-font-mono)",
        }}
      >
        {/* Top-left HUD — inside left viewport */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "5%",
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

        {/* Top-right HUD — inside right viewport */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            right: "5%",
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
      </div>

      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)",
          opacity: "0.4",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          "pointer-events": "none",
          "box-shadow": "inset 0 0 100px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  )
}
