/**
 * Sentry
 * @module sentry
 * @preferred
 * @description Sentry error reporting wrapper
 * @see https://docs.sentry.io/platforms/node/
 */

import SentrySDK from "@sentry/node";
// import { ProfilingIntegration } from "@sentry/profiling-node";

/**
 *
 *
 * @author Drazi Crendraven
 */
function Sentry(): void {
    SentrySDK.init({
        dsn: "https://9cefd6a6a3b940328fcefe45766023f2@o1413557.ingest.sentry.io/4504406901915648",

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
        integrations: [
            // Add profiling integration to list of integrations
            // new ProfilingIntegration(),
        ],
        // "debug": true
    });
}

Sentry();

export { SentrySDK as Sentry };
