import { Component, onMount, onCleanup } from "solid-js";

const TerminalRain: Component = () => {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext("2d")!;
    let animId = 0;
    let time = 0;

    const styles = getComputedStyle(document.documentElement);
    const textTertiary = styles.getPropertyValue("--oc-text-tertiary").trim();

    const TOKENS = [
      "const", "let", "fn", "=>", "{}", "()", "[]", "if", "for",
      "return", "async", "await", "import", "type", "interface",
      "class", "pub", "mut", "impl", "use",
    ];

    const FONT_SIZE = 11;
    const LINE_HEIGHT = 16;
    const TARGET_COLUMNS = 18;

    interface Column {
      x: number;
      y: number;
      speed: number;
      tokens: string[];
      delay: number;
      elapsed: number;
    }

    let columns: Column[] = [];

    const makeColumn = (): Column => {
      const tokenCount = 4 + Math.floor(Math.random() * 8);
      const tokens: string[] = [];
      for (let i = 0; i < tokenCount; i++) {
        tokens.push(TOKENS[Math.floor(Math.random() * TOKENS.length)]);
      }
      return {
        x: Math.random() * canvas.width,
        y: -tokenCount * LINE_HEIGHT,
        speed: 20 + Math.random() * 40,
        tokens,
        delay: Math.random() * 6,
        elapsed: 0,
      };
    };

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();

    // Initialize columns
    for (let i = 0; i < TARGET_COLUMNS; i++) {
      const col = makeColumn();
      col.delay = Math.random() * 8;
      columns.push(col);
    }

    const loop = (prev: number) => (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      time += dt;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = "top";

      for (const col of columns) {
        col.elapsed += dt;
        if (col.elapsed < col.delay) continue;

        col.y += col.speed * dt;

        // Draw tokens in the column
        for (let i = 0; i < col.tokens.length; i++) {
          const tokenY = col.y + i * LINE_HEIGHT;
          if (tokenY < -LINE_HEIGHT || tokenY > canvas.height + LINE_HEIGHT) continue;

          const isHead = i === col.tokens.length - 1;
          ctx.save();
          ctx.fillStyle = textTertiary;
          ctx.globalAlpha = isHead ? 0.3 : 0.15;
          ctx.fillText(col.tokens[i], col.x, tokenY);
          ctx.restore();
        }

        // Reset when fully off screen
        const bottomY = col.y + col.tokens.length * LINE_HEIGHT;
        if (col.y > canvas.height) {
          const fresh = makeColumn();
          col.x = Math.random() * canvas.width;
          col.y = fresh.y;
          col.speed = fresh.speed;
          col.tokens = fresh.tokens;
          col.delay = 0;
          col.elapsed = 0;
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

export { TerminalRain };
