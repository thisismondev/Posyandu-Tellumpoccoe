import { NextResponse } from 'next/server';

/**
 * Helper untuk membuat response API yang konsisten
 */
export class ApiResponse {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status },
    );
  }

  static error(message: string, status: number = 500, details?: any) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(details && { details }),
      },
      { status },
    );
  }

  static badRequest(message: string = 'Bad Request') {
    return this.error(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Not Found') {
    return this.error(message, 404);
  }

  static serverError(message: string = 'Internal Server Error') {
    return this.error(message, 500);
  }
}
