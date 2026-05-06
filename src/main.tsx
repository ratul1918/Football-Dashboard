
  import { createRoot } from "react-dom/client";
  import * as Sentry from "@sentry/react";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Replay({ maskAllText: true, blockAllMedia: true }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }

  const SentryApp = import.meta.env.VITE_SENTRY_DSN ? Sentry.withProfiler(App) : App;

  createRoot(document.getElementById("root")!).render(<SentryApp />);
