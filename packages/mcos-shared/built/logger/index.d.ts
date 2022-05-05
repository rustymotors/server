export namespace logger {
    function child(options: {
        service?: string | undefined;
    }): {
        /** @param {string} message */
        trace: (message: string) => void;
        /** @param {string} message */
        debug: (message: string) => void;
        /** @param {string} message */
        info: (message: string) => void;
        /** @param {string} message */
        warn: (message: string) => void;
        /** @param {string} message */
        error: (message: string) => void;
        /** @param {string} message */
        fatal: (message: string) => void;
        /**
         * @param {ELOGGING_LEVELS} level
         * @param {string} message
         */
        log: (level: "trace" | "all" | "debug" | "info" | "warn" | "error" | "fatal" | "off", message: string) => void;
    };
}
//# sourceMappingURL=index.d.ts.map