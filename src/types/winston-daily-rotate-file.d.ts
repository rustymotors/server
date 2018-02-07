// Type definitions for winston-daily-rotate-file 1.7.2
// Project: https://github.com/winstonjs/winston-daily-rotate-file
// Definitions by: Drazisil <https://github.com/drazisil>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

import { Agent } from 'http';

declare namespace DailyRotateFile {

    interface Options {
        emerg: string | string[];
        alert: string | string[];
        crit: string | string[];
        error: string | string[];
        warning: string | string[];
        notice: string | string[];
        info: string | string[];
        debug: string | string[];
    }
}

export = DailyRotateFile;