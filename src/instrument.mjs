import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { addBreadcrumb } from '@sentry/node';
import { createRoarrSentryIntegration } from '@roarr/sentry';

Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    integrations: [
        // send console.log, console.warn, and console.error calls as logs to Sentry
        Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
        // Add our Profiling integration
        nodeProfilingIntegration(),
        createRoarrSentryIntegration({
            addBreadcrumb: (breadcrumb) => {
                // Your implementation might vary
                addBreadcrumb(breadcrumb);
            },
        }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
    enableLogs: true,
});
