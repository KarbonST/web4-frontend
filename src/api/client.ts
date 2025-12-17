import { getRuntimeConfig } from '../config/runtimeConfig';

export class ApiError extends Error {
    status: number;
    details: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

const normalizeBaseUrl = (value: string | undefined) => {
    if (!value) {
        return '';
    }
    return value.endsWith('/') ? value.slice(0, -1) : value;
};

const resolveBaseUrl = () => {
    const runtimeConfig = typeof window === 'undefined' ? {} : getRuntimeConfig();
    const runtimeUrl = runtimeConfig.VITE_API_URL;
    const hasRuntimeUrl = typeof runtimeUrl === 'string' && runtimeUrl.trim().length > 0 && !runtimeUrl.includes('${VITE_API_URL');
    const source = hasRuntimeUrl ? runtimeUrl : import.meta.env.VITE_API_URL;
    return normalizeBaseUrl(source ?? 'http://localhost:3000');
};

let cachedBaseUrl: string | null = null;

const getApiBaseUrl = () => {
    if (!cachedBaseUrl) {
        cachedBaseUrl = resolveBaseUrl();
    }
    return cachedBaseUrl;
};

const buildUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    if (!path.startsWith('/')) {
        return `${getApiBaseUrl()}/${path}`;
    }
    return `${getApiBaseUrl()}${path}`;
};

interface RequestOptions extends RequestInit {
    token?: string | null;
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const headers = new Headers(options.headers);
    const isJsonBody = options.body && !(options.body instanceof FormData);

    if (isJsonBody && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(buildUrl(path), {
        ...options,
        headers,
    });

    const contentType = response.headers.get('Content-Type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
        const errorBody = isJson ? await response.json().catch(() => null) : await response.text();
        const message = errorBody && typeof errorBody === 'object' && 'message' in errorBody
            ? String((errorBody as { message: string }).message)
            : response.statusText || 'Request failed';
        throw new ApiError(message, response.status, errorBody);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (isJson ? await response.json() : await response.text()) as T;
};
