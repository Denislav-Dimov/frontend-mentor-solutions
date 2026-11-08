export type FieldErrors = Record<string, string[]>;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly status?: number,
    options?: ErrorOptions,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message, options);
    this.name = 'ApiRequestError';
  }
}
