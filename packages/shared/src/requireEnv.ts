/**
 * Read required environment variables, failing with a single error that
 * names every missing one.
 *
 * A variable counts as missing when it is unset or an empty string.
 * This throws instead of exiting, so a library can call it and the
 * entrypoint decides how the process ends.
 *
 * @param names - The variables that must be set
 * @param env - The environment to read (defaults to `process.env`)
 * @returns Each requested name mapped to its value
 * @throws Error listing every missing variable
 */
export function requireEnv(
    names: readonly string[],
    env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
    const values: Record<string, string> = {};
    const missing: string[] = [];

    for (const name of names) {
        const value = env[name];
        if (typeof value === "undefined" || value === "") {
            missing.push(name);
        } else {
            values[name] = value;
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }

    return values;
}
