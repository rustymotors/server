// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require('@sentry/node');

Sentry.init({
    dsn: 'https://5485e7dd22ee3f9761d7560ca1c7ffbb@o1413557.ingest.us.sentry.io/4509952146472960',
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
});
