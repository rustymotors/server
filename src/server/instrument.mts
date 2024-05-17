import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://f4c0126e2fc35876c860dd72fc056db9@o1413557.ingest.sentry.io/4506787875061760",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
  _experiments: {
    metricsAggregator: true,
  },
});
