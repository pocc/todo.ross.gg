import { Router, Route } from "@solidjs/router"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { ErrorBoundary, Suspense } from "solid-js"
import { ServerProvider } from "~/context/server"
import { GlobalSDKProvider } from "~/context/global-sdk"
import { GlobalSyncProvider } from "~/context/global-sync"
import { SettingsProvider } from "~/context/settings"
import { LayoutProvider } from "~/context/layout"
import { CommandProvider } from "~/context/command"
import { ModelsProvider } from "~/context/models"
import { NotificationProvider } from "~/context/notification"
import { HighlightsProvider } from "~/context/highlights"
import { PermissionProvider } from "~/context/permission"
import { HomePage } from "~/pages/home"
import { SessionPage } from "~/pages/session"
import { AppLayout } from "~/pages/layout"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function AppError(props: { error: Error }) {
  return (
    <div class="flex items-center justify-center h-full">
      <div class="text-center space-y-4 p-8 max-w-md">
        <h1 class="text-xl font-semibold" style={{ color: "var(--oc-error)" }}>
          Something went wrong
        </h1>
        <p class="text-sm" style={{ color: "var(--oc-text-secondary)" }}>
          {props.error.message}
        </p>
        <button
          class="px-4 py-2 rounded-md text-sm font-medium"
          style={{
            background: "var(--oc-accent-primary)",
            color: "var(--oc-accent-text)",
          }}
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </div>
  )
}

function AppProviders(props: { children: any }) {
  return (
    <ErrorBoundary fallback={(err) => <AppError error={err} />}>
      <QueryClientProvider client={queryClient}>
        <ServerProvider>
          <GlobalSDKProvider>
            <GlobalSyncProvider>
              <SettingsProvider>
                <PermissionProvider>
                  <LayoutProvider>
                    <NotificationProvider>
                      <ModelsProvider>
                        <CommandProvider>
                          <HighlightsProvider>
                            <Suspense
                              fallback={
                                <div class="flex items-center justify-center h-full">
                                  <div
                                    class="animate-spin w-6 h-6 border-2 rounded-full"
                                    style={{
                                      "border-color": "var(--oc-border-primary)",
                                      "border-top-color": "var(--oc-accent-primary)",
                                    }}
                                  />
                                </div>
                              }
                            >
                              {props.children}
                            </Suspense>
                          </HighlightsProvider>
                        </CommandProvider>
                      </ModelsProvider>
                    </NotificationProvider>
                  </LayoutProvider>
                </PermissionProvider>
              </SettingsProvider>
            </GlobalSyncProvider>
          </GlobalSDKProvider>
        </ServerProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export function App() {
  return (
    <AppProviders>
      <Router>
        <Route path="/" component={HomePage} />
        <Route path="/:dir" component={AppLayout}>
          <Route path="/session/:id?" component={SessionPage} />
          <Route path="/" component={SessionPage} />
        </Route>
      </Router>
    </AppProviders>
  )
}
