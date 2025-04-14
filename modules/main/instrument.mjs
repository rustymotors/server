import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Ensure to call this before importing any other modules!
Sentry.init({
    dsn: 'https://f4c0126e2fc35876c860dd72fc056db9@o1413557.ingest.us.sentry.io/4506787875061760',
    integrations: [
        // Add our Profiling integration
        nodeProfilingIntegration(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#tracesSampleRate
    tracesSampleRate: 1.0,

    // Set profilesSampleRate to 1.0 to profile 100%
    // of sampled transactions.
    // This is relative to tracesSampleRate
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#profilesSampleRate
    profilesSampleRate: 1.0,
});
