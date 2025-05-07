import { describe, expect, it, vi } from 'vitest';
import { getPersonasByPersonaId } from '../src/getPersonasByPersonaId.js';
import { personaRecords } from '../src/internal.js';

describe('getPersonasByPersonaId', () => {
    it('returns a persona', async () => {
        // arrange
        const id = 22;

        // act
        const result = await getPersonasByPersonaId({
            personaId: id,
        });

        // assert
        expect(result).toBeInstanceOf(Array);
        expect(result[0].personaId).toBe(id);
    });

    describe('getPersonasByPersonaId', () => {
        it('returns a persona when a matching ID is found', async () => {
            // arrange
            const id = 21;

            vi.mock('rocky-motors-database', () => {
                return {
                    DatabaseManager: {
                        getPersonasByPersonaId: async (personaId: number) => {
                            return [
                                {
                                    personaId,
                                    personaName: 'test',
                                    personaDescription: 'test',
                                    personaImage: 'test',
                                },
                            ];
                        },
                    },
                };
            });

            // act
            const result = await getPersonasByPersonaId({ personaId: id });

            // assert
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(1);
            expect(result[0].personaId).toBe(id);
        });

        it('returns an empty array when no matching ID is found', async () => {
            // arrange
            const id = 3;

            // act & assert
            await expect(
                getPersonasByPersonaId({
                    personaId: id,
                }),
            ).resolves.toEqual([]);
        });

        vi.mock('../src/internal.js', () => ({
            personaRecords: [
                {
                    customerId: 1,
                    personaId: 22,
                    personaName: 'Persona A',
                    shardId: 'shard-1',
                },
                {
                    customerId: 2,
                    personaId: 21,
                    personaName: 'Persona B',
                    shardId: 'shard-2',
                },
            ],
        }));

        describe('getPersonasByPersonaId', () => {
            it('returns personas matching the given personaId', async () => {
                // arrange
                const id = 22;

                // act
                const result = await getPersonasByPersonaId({ personaId: id });

                // assert
                expect(result).toBeInstanceOf(Array);
                expect(result.length).toBe(1);
                expect(result[0]).toEqual({
                    customerId: 1,
                    personaId: 22,
                    personaName: 'Persona A',
                    shardId: 'shard-1',
                });
            });

            it('returns an empty array when no personas match the given personaId', async () => {
                // arrange
                const id = 99;

                // act
                const result = await getPersonasByPersonaId({ personaId: id });

                // assert
                expect(result).toBeInstanceOf(Array);
                expect(result.length).toBe(0);
            });
        });
    });
});
