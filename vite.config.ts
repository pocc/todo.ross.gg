import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"
import { execSync } from "child_process"

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf-8" }).trim()
  } catch {
    return "unknown"
  }
}

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_HASH__: JSON.stringify(git("rev-parse --short HEAD")),
    __COMMIT_TIME__: JSON.stringify(git("log -1 --format=%cI")),
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
})
