import { describe, it, expect } from 'vitest';
import { RaceCreatedMessage } from './RaceInfo.js';

describe('RaceCreatedMessage', () => {
    it('should mask password in logs', () => {
        const msg = new RaceCreatedMessage();
        msg.setPassword('secret');
        
        const logString = msg.toLogString();
        const logObj = JSON.parse(logString);
        
        expect(logObj.password).toBe('[REDACTED]');
        expect(logString).not.toContain('secret');
    });

    it('should handle undefined password', () => {
        const msg = new RaceCreatedMessage();
        // Password not set
        
        const logString = msg.toLogString();
        const logObj = JSON.parse(logString);
        
        expect(logObj.password).toBeUndefined();
    });
});
