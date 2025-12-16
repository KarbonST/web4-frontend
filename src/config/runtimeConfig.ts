export type RuntimeConfig = {
    VITE_API_URL?: string;
};

const getWindowConfig = (): RuntimeConfig => {
    if (typeof window === 'undefined') {
        return {};
    }
    const payload = (window as typeof window & { __APP_CONFIG__?: RuntimeConfig }).__APP_CONFIG__;
    return payload ?? {};
};

let cachedConfig: RuntimeConfig | null = null;

export const getRuntimeConfig = (): RuntimeConfig => {
    if (!cachedConfig) {
        cachedConfig = getWindowConfig();
    }
    return cachedConfig;
};
