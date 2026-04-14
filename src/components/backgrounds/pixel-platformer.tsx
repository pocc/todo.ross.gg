import { Component, onMount, onCleanup } from "solid-js"

const PixelPlatformer: Component = () => {
  let canvas!: HTMLCanvasElement

  onMount(() => {
    const ctx = canvas.getContext("2d")!
    let animId = 0
    const isDark = () => document.documentElement.getAttribute("data-theme-mode") !== "light"

    // --- Types ---
    interface FlowParticle {
      angle: number; dist: number; speed: number; size: number
      hue: number; offset: number; wobbleSpeed: number; trail: number
    }
    interface OrbitDot {
      angle: number; radius: number; speed: number; size: number
      hue: number; pulse: number; pulseSpeed: number
    }
    interface BgStar {
      x: number; y: number; size: number; hue: number; phase: number; speed: number
    }
    interface Nebula {
      cx: number; cy: number; rx: number; ry: number
      hue: number; sat: number; phase: number; speed: number
    }

    // --- Config ---
    const FLOW_COUNT = 280
    const ORBIT_COUNT = 90
    const STAR_COUNT = 120

    let flows: FlowParticle[] = []
    let orbits: OrbitDot[] = []
    let bgStars: BgStar[] = []
    const nebulae: Nebula[] = [
      { cx: 0.18, cy: 0.22, rx: 0.22, ry: 0.18, hue: 270, sat: 65, phase: 0, speed: 0.06 },
      { cx: 0.78, cy: 0.18, rx: 0.20, ry: 0.14, hue: 220, sat: 60, phase: 2, speed: 0.05 },
      { cx: 0.55, cy: 0.68, rx: 0.25, ry: 0.16, hue: 310, sat: 50, phase: 4, speed: 0.08 },
      { cx: 0.08, cy: 0.58, rx: 0.18, ry: 0.14, hue: 200, sat: 65, phase: 1, speed: 0.07 },
      { cx: 0.88, cy: 0.52, rx: 0.18, ry: 0.12, hue: 340, sat: 55, phase: 3, speed: 0.06 },
      { cx: 0.42, cy: 0.32, rx: 0.28, ry: 0.20, hue: 250, sat: 45, phase: 5, speed: 0.04 },
      { cx: 0.65, cy: 0.42, rx: 0.15, ry: 0.12, hue: 290, sat: 55, phase: 6, speed: 0.07 },
      { cx: 0.32, cy: 0.52, rx: 0.18, ry: 0.14, hue: 180, sat: 50, phase: 7, speed: 0.08 },
    ]

    function mkFlow(): FlowParticle {
      return {
        angle: Math.random() * Math.PI * 2,
        dist: 0.4 + Math.random() * 0.9,
        speed: 0.03 + Math.random() * 0.09,
        size: 1 + Math.random() * 3,
        hue: [220, 240, 260, 280, 300, 320, 200, 180][Math.floor(Math.random() * 8)],
        offset: (Math.random() - 0.5) * 0.4,
        wobbleSpeed: 0.5 + Math.random() * 1.5,
        trail: 0.3 + Math.random() * 0.7,
      }
    }

    function mkOrbit(): OrbitDot {
      return {
        angle: Math.random() * Math.PI * 2,
        radius: 0.06 + Math.random() * 0.5,
        speed: (0.15 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
        size: 1 + Math.random() * 2.5,
        hue: [240, 260, 280, 300, 200][Math.floor(Math.random() * 5)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 1 + Math.random() * 2,
      }
    }

    function init() {
      flows = Array.from({ length: FLOW_COUNT }, (_, i) => {
        const p = mkFlow(); p.dist = (i / FLOW_COUNT) * 1.3; return p
      })
      orbits = Array.from({ length: ORBIT_COUNT }, mkOrbit)
      bgStars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random(), y: Math.random(),
        size: 0.5 + Math.random() * 2,
        hue: 210 + Math.random() * 70,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1.5,
      }))
    }

    function resize() {
      const r = canvas.parentElement!.getBoundingClientRect()
      canvas.width = r.width; canvas.height = r.height
      if (!flows.length) init()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    resize()

    const loop = (prev: number) => (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05)
      const t = now / 1000
      const w = canvas.width, h = canvas.height
      const dark = isDark()
      const cx = w * 0.5, cy = h * 0.47
      const maxR = Math.max(w, h) * 0.7

      // === SKY ===
      const sky = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
      if (dark) {
        sky.addColorStop(0, "#100c22")
        sky.addColorStop(0.4, "#0a0818")
        sky.addColorStop(1, "#040310")
      } else {
        sky.addColorStop(0, "#e0d8f6")
        sky.addColorStop(0.35, "#d2c8f0")
        sky.addColorStop(0.7, "#c0b5e6")
        sky.addColorStop(1, "#b0a5dc")
      }
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      // === NEBULAE — large soft color patches ===
      for (const n of nebulae) {
        const nx = (n.cx + Math.sin(t * n.speed + n.phase) * 0.03) * w
        const ny = (n.cy + Math.cos(t * n.speed * 0.7 + n.phase) * 0.02) * h
        const nrx = n.rx * w, nry = n.ry * h
        const a = dark ? 0.14 : 0.16
        const l = dark ? 50 : 58
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(nrx, nry))
        g.addColorStop(0, `hsla(${n.hue},${n.sat}%,${l}%,${a})`)
        g.addColorStop(0.35, `hsla(${n.hue + 15},${n.sat - 10}%,${l - 5}%,${a * 0.5})`)
        g.addColorStop(0.7, `hsla(${n.hue - 10},${n.sat - 20}%,${l - 10}%,${a * 0.2})`)
        g.addColorStop(1, `hsla(${n.hue},${n.sat}%,${l}%,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(nx, ny, nrx, nry, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // === BACKGROUND STARS ===
      ctx.save()
      for (const s of bgStars) {
        const tw = 0.4 + 0.6 * Math.sin(t * s.speed + s.phase)
        ctx.globalAlpha = tw * (dark ? 0.5 : 0.25)
        ctx.fillStyle = `hsl(${s.hue},30%,${dark ? 85 : 35}%)`
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2)
        ctx.fill()
        // Soft glow for bigger ones
        if (s.size > 1.3) {
          ctx.globalAlpha = tw * (dark ? 0.15 : 0.08)
          ctx.beginPath()
          ctx.arc(s.x * w, s.y * h, s.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()

      // === CENTRAL GLOW — pulsing ===
      const glowSize = 150 + 30 * Math.sin(t * 0.5) + 15 * Math.sin(t * 1.1)
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize)
      cg.addColorStop(0, `hsla(260,70%,${dark ? 70 : 60}%,${dark ? 0.14 : 0.1})`)
      cg.addColorStop(0.4, `hsla(270,55%,${dark ? 58 : 52}%,${dark ? 0.06 : 0.04})`)
      cg.addColorStop(1, "hsla(260,50%,50%,0)")
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2)
      ctx.fill()

      // === ORBIT DOTS ===
      ctx.save()
      for (const o of orbits) {
        o.angle += o.speed * dt
        o.pulse += o.pulseSpeed * dt
        const r = o.radius * maxR * 0.5
        const px = cx + Math.cos(o.angle) * r
        const py = cy + Math.sin(o.angle) * r * 0.6
        const pa = (0.3 + 0.2 * Math.sin(o.pulse)) * (dark ? 0.45 : 0.3)
        // Glow
        ctx.globalAlpha = pa * 0.5
        const og = ctx.createRadialGradient(px, py, 0, px, py, o.size * 6)
        og.addColorStop(0, `hsla(${o.hue},55%,${dark ? 72 : 52}%,1)`)
        og.addColorStop(1, `hsla(${o.hue},55%,60%,0)`)
        ctx.fillStyle = og
        ctx.beginPath()
        ctx.arc(px, py, o.size * 6, 0, Math.PI * 2)
        ctx.fill()
        // Core
        ctx.globalAlpha = pa
        ctx.fillStyle = `hsl(${o.hue},35%,${dark ? 90 : 38}%)`
        ctx.beginPath()
        ctx.arc(px, py, o.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // === FLOW PARTICLES — converging inward ===
      ctx.save()
      for (let i = 0; i < flows.length; i++) {
        const p = flows[i]
        p.dist -= p.speed * dt
        if (p.dist <= 0.02) { flows[i] = mkFlow(); flows[i].dist = 0.8 + Math.random() * 0.5; continue }

        const wobble = Math.sin(t * p.wobbleSpeed + p.angle * 3) * p.offset * p.dist
        const a = p.angle + wobble
        const r = p.dist * maxR * 0.55
        const px = cx + Math.cos(a) * r
        const py = cy + Math.sin(a) * r * 0.65

        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue

        const proximity = 1 - p.dist
        const edgeFade = Math.min(p.dist * 3, 1)
        const alpha = proximity * edgeFade * (dark ? 0.7 : 0.5)
        if (alpha < 0.01) continue

        // Trail
        const trailLen = p.trail * 25 * p.dist
        const trailDx = Math.cos(a) * trailLen
        const trailDy = Math.sin(a) * trailLen * 0.65
        ctx.globalAlpha = alpha * 0.5
        const tg = ctx.createLinearGradient(px, py, px + trailDx, py + trailDy)
        tg.addColorStop(0, `hsla(${p.hue},50%,${dark ? 78 : 42}%,1)`)
        tg.addColorStop(1, `hsla(${p.hue},50%,${dark ? 78 : 42}%,0)`)
        ctx.strokeStyle = tg
        ctx.lineWidth = p.size * 0.4
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px + trailDx, py + trailDy)
        ctx.stroke()

        // Glow for bigger/closer
        if (p.size > 1.8 && proximity > 0.3) {
          ctx.globalAlpha = alpha * 0.25
          const pg = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5)
          pg.addColorStop(0, `hsla(${p.hue},55%,${dark ? 72 : 52}%,1)`)
          pg.addColorStop(1, `hsla(${p.hue},55%,60%,0)`)
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.arc(px, py, p.size * 5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Core
        ctx.globalAlpha = alpha
        ctx.fillStyle = `hsl(${p.hue},30%,${dark ? 95 : 30}%)`
        ctx.beginPath()
        ctx.arc(px, py, p.size * (0.5 + proximity * 0.5), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // === VIGNETTE ===
      ctx.save()
      const vig = ctx.createRadialGradient(cx, cy, w * 0.2, cx, cy, w * 0.85)
      vig.addColorStop(0, "rgba(0,0,0,0)")
      if (dark) {
        vig.addColorStop(1, "rgba(0,0,0,0.4)")
      } else {
        vig.addColorStop(0.6, "rgba(70,40,110,0)")
        vig.addColorStop(1, "rgba(70,40,110,0.1)")
      }
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      animId = requestAnimationFrame(loop(now))
    }

    animId = requestAnimationFrame(loop(performance.now()))
    onCleanup(() => { cancelAnimationFrame(animId); ro.disconnect() })
  })

  return <canvas ref={canvas!} style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
}

export { PixelPlatformer }
