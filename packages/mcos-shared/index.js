/**
 *
 *
 * @param {unknown} error
 * @return {string}
 */
export function errorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
