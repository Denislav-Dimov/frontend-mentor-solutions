export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiRequestError';
  }
}
