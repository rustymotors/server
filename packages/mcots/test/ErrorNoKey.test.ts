import { describe, it, expect } from 'vitest';
import { ErrorNoKey } from '../src/errors/ErrorNoKey';

describe('ErrorNoKey', () => {
    it('should have default message "No key provided" when no message is given', () => {
        const error = new ErrorNoKey();
        expect(error.message).toBe("No key provided");
    });

    it('should use the provided message', () => {
        const customMessage = "Custom error message";
        const error = new ErrorNoKey(customMessage);
        expect(error.message).toBe(customMessage);
    });
});