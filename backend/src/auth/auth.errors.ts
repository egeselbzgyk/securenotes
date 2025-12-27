export class AuthError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }

  static badRequest(code: string) {
    return new AuthError(400, code);
  }
  static conflict(code: string) {
    return new AuthError(409, code);
  }
  static unauthorized(code: string) {
    return new AuthError(401, code);
  }
}
