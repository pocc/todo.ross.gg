import { render } from "solid-js/web"
import { MetaProvider } from "@solidjs/meta"
import { ThemeProvider } from "~/ui/theme"
import { LanguageProvider } from "~/context/language"
import { App } from "~/app"
import "./index.css"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

render(
  () => (
    <MetaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </MetaProvider>
  ),
  root,
)
