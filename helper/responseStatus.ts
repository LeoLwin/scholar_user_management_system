
export interface ResponseStatus {
  code: string;
  status: string;
  message: string;
  data?: any;
  url?: string;
}

const OK = (data?: any, message?: string): ResponseStatus => ({
  code: "200",
  status: "OK",
  message: message || "No Error",
  ...(data && { data }),
});

const SEE_OTHER = (url?: string, message?: string): ResponseStatus => ({
  code: "303",
  status: "SEE_OTHER",
  message: message || "Please follow the URL provided",
  ...(url && { url }),
});

const REDIRECT = (url?: string, message?: string): ResponseStatus => ({
  code: "303",
  status: "SEE_OTHER",
  message: message || "Please follow the URL provided",
  ...(url && { url }),
});

const INVALID_ARGUMENT = (message?: string): ResponseStatus => ({
  code: "400",
  status: "INVALID_ARGUMENT",
  message: message || "Client specified an invalid argument",
});

const UNAUTHENTICATED = (message?: string): ResponseStatus => ({
  code: "401",
  status: "UNAUTHENTICATED",
  message: message || "Request is not authenticated",
});

const PERMISSION_DENIED = (message?: string): ResponseStatus => ({
  code: "403",
  status: "PERMISSION_DENIED",
  message: message || "Permission denied",
});

const NOT_FOUND = (message?: string): ResponseStatus => ({
  code: "404",
  status: "NOT_FOUND",
  message: message || "A specified resource is not found",
});

const ALREADY_EXISTS = (message?: string): ResponseStatus => ({
  code: "409",
  status: "ALREADY_EXISTS",
  message: message || "Resource already exists",
});

const RESOURCE_EXHAUSTED = (message?: string): ResponseStatus => ({
  code: "429",
  status: "RESOURCE_EXHAUSTED",
  message: message || "Out of resource",
});

const CANCELLED = (message?: string): ResponseStatus => ({
  code: "499",
  status: "CANCELLED",
  message: message || "Request cancelled by the client",
});

const UNKNOWN = (message?: string): ResponseStatus => ({
  code: "500",
  status: "UNKNOWN",
  message: message || "Unknown Server Error",
});

const NOT_IMPLEMENTED = (message?: string): ResponseStatus => ({
  code: "501",
  status: "NOT_IMPLEMENTED",
  message: message || "API method is not implemented by the server",
});

const UNAVAILABLE = (message?: string): ResponseStatus => ({
  code: "503",
  status: "UNAVAILABLE",
  message: message || "Service unavailable",
});

const DEADLINE_EXCEEDED = (message?: string): ResponseStatus => ({
  code: "504",
  status: "DEADLINE_EXCEEDED",
  message: message || "Request deadline exceeded",
});

export default  {
  OK,
  SEE_OTHER,
  REDIRECT,
  INVALID_ARGUMENT,
  UNAUTHENTICATED,
  PERMISSION_DENIED,
  NOT_FOUND,
  ALREADY_EXISTS,
  RESOURCE_EXHAUSTED,
  CANCELLED,
  UNKNOWN,
  NOT_IMPLEMENTED,
  UNAVAILABLE,
  DEADLINE_EXCEEDED,
};
