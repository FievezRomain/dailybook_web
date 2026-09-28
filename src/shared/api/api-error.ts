export type WebApiErrorPayload = {
  code: string;
  message: string;
  status: number;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};

export class WebApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly requestId?: string;

  constructor(payload: WebApiErrorPayload) {
    super(payload.message);
    this.name = 'WebApiError';
    this.code = payload.code;
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors;
    this.requestId = payload.requestId;
  }
}
