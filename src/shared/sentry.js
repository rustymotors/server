import Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";


class SentryInit {
    
    /**  @type {Sentry} */
    static _instance
  
}

/**
 *
 *
 * @author Drazi Crendraven
 * @returns {Sentry}  
 */
function getSentry() {
    if (typeof SentryInit._instance === "undefined") {
        SentryInit._instance = Sentry
        SentryInit._instance.init({
            dsn: "https://9cefd6a6a3b940328fcefe45766023f2@o1413557.ingest.sentry.io/4504406901915648",
        
            // We recommend adjusting this value in production, or using tracesSampler
            // for finer control
            tracesSampleRate: 1.0,
            profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
            integrations: [
              // Add profiling integration to list of integrations
              new ProfilingIntegration(),
            ],
        });
    }
    return SentryInit._instance
}

const sentryInstance = getSentry()

export { sentryInstance as Sentry }
