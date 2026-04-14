import { Component, onMount, onCleanup } from "solid-js";

const WaveTerrain: Component = () => {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext("2d")!;
    let animId = 0;
    let time = 0;

    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue("--oc-accent-primary").trim();
    const textTertiary = styles.getPropertyValue("--oc-text-tertiary").trim();

    interface Firefly {
      x: number;
      y: number;
      startY: number;
      age: number;
      maxAge: number;
      speed: number;
      drift: number;
    }

    const layers = [
      { freq: 0.003, amp: 0.08, speed: 8, opacity: 0.05, offset: 0.55, color: textTertiary },
      { freq: 0.005, amp: 0.1, speed: 14, opacity: 0.08, offset: 0.6, color: accentColor },
      { freq: 0.007, amp: 0.07, speed: 22, opacity: 0.12, offset: 0.65, color: textTertiary },
      { freq: 0.01, amp: 0.06, speed: 30, opacity: 0.18, offset: 0.7, color: accentColor },
    ];

    let fireflies: Firefly[] = [];
    let lastSpawn = 0;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();

    const getWaveY = (x: number, layer: (typeof layers)[0], t: number): number => {
      const base = canvas.height * layer.offset;
      return (
        base +
        Math.sin((x + t * layer.speed) * layer.freq) * canvas.height * layer.amp +
        Math.sin((x + t * layer.speed * 0.7) * layer.freq * 1.8) * canvas.height * layer.amp * 0.4
      );
    };

    const loop = (prev: number) => (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      time += dt;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw wave layers
      for (const layer of layers) {
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 3) {
          ctx.lineTo(x, getWaveY(x, layer, time));
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Spawn fireflies
      lastSpawn += dt;
      if (lastSpawn > 2) {
        lastSpawn = 0;
        const fx = Math.random() * canvas.width;
        const frontLayer = layers[layers.length - 1];
        const fy = getWaveY(fx, frontLayer, time);
        fireflies.push({
          x: fx,
          y: fy,
          startY: fy,
          age: 0,
          maxAge: 4 + Math.random() * 3,
          speed: 15 + Math.random() * 20,
          drift: (Math.random() - 0.5) * 10,
        });
      }

      // Update and draw fireflies
      fireflies = fireflies.filter((f) => f.age < f.maxAge);
      ctx.save();
      for (const f of fireflies) {
        f.age += dt;
        f.y -= f.speed * dt;
        f.x += f.drift * dt;
        const progress = f.age / f.maxAge;
        const alpha = 0.3 * (1 - progress);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

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

export { WaveTerrain };
