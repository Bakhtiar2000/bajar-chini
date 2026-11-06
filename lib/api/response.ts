import { NextResponse } from 'next/server'
import { unstable_rethrow } from 'next/navigation'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ data }, init)
export const created = <T>(data: T) => NextResponse.json({ data }, { status: 201 })

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, details } }, { status })
}

export const notFoundError = (what = 'Resource') =>
  new ApiError(404, 'NOT_FOUND', `${what} not found`)
export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, 'BAD_REQUEST', message, details)

/** Converts any thrown error into a consistent JSON error response. */
export function handleError(error: unknown) {
  // Let Next.js internal control-flow errors (prerender bail-outs, redirects) propagate.
  unstable_rethrow(error)
  if (error instanceof ApiError) return fail(error.status, error.code, error.message, error.details)
  if (error instanceof ZodError) {
    return fail(
      422,
      'VALIDATION_ERROR',
      'Invalid request data',
      error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    )
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return fail(
      422,
      'VALIDATION_ERROR',
      'Invalid data',
      Object.values(error.errors).map((e) => ({ path: e.path, message: e.message })),
    )
  }
  if (error instanceof mongoose.Error.CastError) {
    return fail(400, 'INVALID_ID', `Invalid value for ${error.path}`)
  }
  const mongoCode = (error as { code?: number })?.code
  if (mongoCode === 11000) {
    const keyValue = (error as { keyValue?: Record<string, unknown> }).keyValue
    return fail(409, 'DUPLICATE', 'A record with the same unique value already exists', keyValue)
  }
  if (error instanceof SyntaxError)
    return fail(400, 'INVALID_JSON', 'Request body must be valid JSON')
  console.error('[api] unexpected error', error)
  return fail(500, 'INTERNAL_ERROR', 'Something went wrong')
}

export async function readJson(request: Request): Promise<unknown> {
  const type = request.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json')
  }
  return request.json()
}

export function isObjectId(value: string) {
  return mongoose.isValidObjectId(value) && /^[a-f0-9]{24}$/i.test(value)
}

export function assertObjectId(value: string, what = 'id') {
  if (!isObjectId(value)) throw new ApiError(400, 'INVALID_ID', `Invalid ${what}`)
}
