"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OK = (data, message) => (Object.assign({ code: "200", status: "OK", message: message || "No Error" }, (data && { data })));
const SEE_OTHER = (url, message) => (Object.assign({ code: "303", status: "SEE_OTHER", message: message || "Please follow the URL provided" }, (url && { url })));
const REDIRECT = (url, message) => (Object.assign({ code: "303", status: "SEE_OTHER", message: message || "Please follow the URL provided" }, (url && { url })));
const INVALID_ARGUMENT = (message) => ({
    code: "400",
    status: "INVALID_ARGUMENT",
    message: message || "Client specified an invalid argument",
});
const UNAUTHENTICATED = (message) => ({
    code: "401",
    status: "UNAUTHENTICATED",
    message: message || "Request is not authenticated",
});
const PERMISSION_DENIED = (message) => ({
    code: "403",
    status: "PERMISSION_DENIED",
    message: message || "Permission denied",
});
const NOT_FOUND = (message) => ({
    code: "404",
    status: "NOT_FOUND",
    message: message || "A specified resource is not found",
});
const ALREADY_EXISTS = (message) => ({
    code: "409",
    status: "ALREADY_EXISTS",
    message: message || "Resource already exists",
});
const RESOURCE_EXHAUSTED = (message) => ({
    code: "429",
    status: "RESOURCE_EXHAUSTED",
    message: message || "Out of resource",
});
const CANCELLED = (message) => ({
    code: "499",
    status: "CANCELLED",
    message: message || "Request cancelled by the client",
});
const UNKNOWN = (message) => ({
    code: "500",
    status: "UNKNOWN",
    message: message || "Unknown Server Error",
});
const NOT_IMPLEMENTED = (message) => ({
    code: "501",
    status: "NOT_IMPLEMENTED",
    message: message || "API method is not implemented by the server",
});
const UNAVAILABLE = (message) => ({
    code: "503",
    status: "UNAVAILABLE",
    message: message || "Service unavailable",
});
const DEADLINE_EXCEEDED = (message) => ({
    code: "504",
    status: "DEADLINE_EXCEEDED",
    message: message || "Request deadline exceeded",
});
exports.default = {
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
