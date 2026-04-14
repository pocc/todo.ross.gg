import { Component, onMount, onCleanup } from "solid-js";

const WeatherSystem: Component = () => {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext("2d")!;
    let animId = 0;
    let time = 0;

    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue("--oc-accent-primary").trim();
    const textTertiary = styles.getPropertyValue("--oc-text-tertiary").trim();
    const bgPrimary = styles.getPropertyValue("--oc-bg-primary").trim();

    interface Star {
      x: number;
      y: number;
      size: number;
      pulseSpeed: number;
      pulseOffset: number;
    }

    interface Cloud {
      x: number;
      y: number;
      width: number;
      speed: number;
    }

    interface ShootingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }

    let stars: Star[] = [];
    let clouds: Cloud[] = [];
    let shootingStars: ShootingStar[] = [];

    const initStars = () => {
      stars = [];
      const count = 50 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.7,
          size: 0.5 + Math.random() * 1.5,
          pulseSpeed: 0.5 + Math.random() * 2,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const initClouds = () => {
      clouds = [];
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        clouds.push({
          x: Math.random() * canvas.width,
          y: canvas.height * 0.15 + Math.random() * canvas.height * 0.35,
          width: 80 + Math.random() * 120,
          speed: 5 + Math.random() * 10,
        });
      }
    };

    type Period = "night" | "morning" | "afternoon" | "evening";
    const getPeriod = (): Period => {
      const h = new Date().getHours();
      if (h >= 20 || h < 5) return "night";
      if (h >= 5 && h < 11) return "morning";
      if (h >= 11 && h < 16) return "afternoon";
      return "evening";
    };

    const getSunPosition = (period: Period): { x: number; y: number; visible: boolean } => {
      const w = canvas.width;
      const h = canvas.height;
      const hour = new Date().getHours();
      const min = new Date().getMinutes();
      const t = hour + min / 60;

      if (period === "morning") {
        const progress = (t - 5) / 6;
        return { x: w * 0.7 + w * 0.2 * progress, y: h * 0.9 - h * 0.5 * progress, visible: true };
      }
      if (period === "afternoon") {
        const progress = (t - 11) / 5;
        return { x: w * 0.5 - w * 0.2 * progress, y: h * 0.25 + h * 0.1 * progress, visible: true };
      }
      if (period === "evening") {
        const progress = (t - 16) / 4;
        return { x: w * 0.3 - w * 0.15 * progress, y: h * 0.4 + h * 0.5 * progress, visible: true };
      }
      return { x: 0, y: 0, visible: false };
    };

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initStars();
      initClouds();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();

    const drawNight = (dt: number) => {
      // Stars
      ctx.save();
      for (const s of stars) {
        const pulse = 0.3 + 0.7 * ((Math.sin(time * s.pulseSpeed + s.pulseOffset) + 1) / 2);
        ctx.globalAlpha = 0.2 * pulse;
        ctx.fillStyle = textTertiary;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Shooting stars
      if (Math.random() < 0.003) {
        shootingStars.push({
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.3,
          vx: 200 + Math.random() * 150,
          vy: 100 + Math.random() * 80,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.4,
        });
      }

      ctx.save();
      shootingStars = shootingStars.filter((s) => s.life < s.maxLife);
      for (const s of shootingStars) {
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const alpha = 0.25 * (1 - s.life / s.maxLife);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.08, s.y - s.vy * 0.08);
        ctx.stroke();
      }
      ctx.restore();

      // Aurora bands near top
      ctx.save();
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 3; i++) {
        const y = canvas.height * 0.05 + i * 20;
        ctx.fillStyle = i % 2 === 0 ? accentColor : textTertiary;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvas.width; x += 5) {
          ctx.lineTo(x, y + Math.sin((x * 0.008) + time * 0.5 + i) * 12);
        }
        ctx.lineTo(canvas.width, y + 25);
        ctx.lineTo(0, y + 25);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const drawSun = (sun: { x: number; y: number }, period: Period) => {
      const radius = 40;
      ctx.save();
      const warmth = period === "morning" || period === "evening" ? 0.2 : 0.15;
      ctx.globalAlpha = warmth;
      const grad = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, radius * 2.5);
      grad.addColorStop(0, accentColor);
      grad.addColorStop(0.4, accentColor);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.globalAlpha = warmth + 0.05;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawClouds = () => {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = textTertiary;
      for (const c of clouds) {
        c.x += c.speed * 0.016;
        if (c.x > canvas.width + c.width) c.x = -c.width;
        // Cloud as overlapping ellipses
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(
            c.x + i * c.width * 0.3,
            c.y + (i === 1 ? -8 : 0),
            c.width * 0.25,
            c.width * 0.12,
            0, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const loop = (prev: number) => (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      time += dt;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const period = getPeriod();
      const sun = getSunPosition(period);

      if (period === "night") {
        drawNight(dt);
      } else {
        if (sun.visible) drawSun(sun, period);
        drawClouds();

        // Subtle gradient overlay for morning/evening warmth
        if (period === "morning" || period === "evening") {
          ctx.save();
          ctx.globalAlpha = 0.06;
          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(0.6, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop(now));
    };

    animId = requestAnimationFrame(loop(performance.now()));

    onCleanup(() => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    });
  });

  return (
    <canvas
      ref={canvas!}
      style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }}
    />
  );
};

export { WeatherSystem };
