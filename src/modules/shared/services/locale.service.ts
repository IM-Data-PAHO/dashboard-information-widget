import api from './api.service';

const config = require('../../../config/config.json');

const DEFAULT_SUPPORTED_LOCALES = ['en', 'es', 'fr'];
const DEFAULT_LOCALE = 'en';

let cachedLocaleSettings: {
    supportedLocales: string[];
    defaultLocale: string;
    allowLocaleOverride: boolean;
} | null = null;

let cachedResolvedLocale: string | null = null;

export function normalizeLocale(value: string | null | undefined): string | null {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim().replace('_', '-').toLowerCase();
    if (!trimmed) return null;
    return trimmed;
}

export function getLanguagePart(locale: string | null | undefined): string | null {
    const normalized = normalizeLocale(locale);
    if (!normalized) return null;
    return normalized.split('-')[0] || null;
}

function dedupeLocales(locales: string[]): string[] {
    return Array.from(new Set(locales.map((l) => normalizeLocale(l)).filter((l): l is string => Boolean(l))));
}

function getOverrideLocaleFromUrl(): string | null {
    const candidates = [window.location.search, window.location.hash];

    try {
        candidates.push(window.parent.location.search, window.parent.location.hash);
    } catch (e) {
        // Ignore cross-origin parent access errors.
    }

    for (const candidate of candidates) {
        if (!candidate || candidate.indexOf('?') === -1) continue;
        const query = candidate.slice(candidate.indexOf('?') + 1);
        const params = new URLSearchParams(query);
        const value = params.get('lang') || params.get('locale');
        const normalized = normalizeLocale(value);
        if (normalized) return normalized;
    }

    return null;
}

async function getUserLocaleFromDhis2(): Promise<string | null> {
    try {
        const me = await api.get('/me?fields=uiLocale,settings[keyUiLocale,keyDbLocale]');
        const locale =
            normalizeLocale(me?.uiLocale) ||
            normalizeLocale(me?.settings?.keyUiLocale) ||
            normalizeLocale(me?.settings?.keyDbLocale);
        return locale;
    } catch (e) {
        return null;
    }
}

export async function getLocaleSettings() {
    if (cachedLocaleSettings) return cachedLocaleSettings;

    const settings = {
        supportedLocales: DEFAULT_SUPPORTED_LOCALES,
        defaultLocale: DEFAULT_LOCALE,
        allowLocaleOverride: true,
    };

    try {
        const configuration = await api.get(`/dataStore/${config.datastoreNamespace}/configuration`);
        const configuredLocales = configuration?.[config.supportedLocalesConfigKey];
        const configuredDefault = normalizeLocale(configuration?.[config.defaultLocaleConfigKey]);
        const allowOverride = configuration?.[config.allowLocaleOverrideConfigKey];

        if (Array.isArray(configuredLocales) && configuredLocales.length > 0) {
            settings.supportedLocales = dedupeLocales(configuredLocales as string[]);
        }

        if (configuredDefault) {
            settings.defaultLocale = configuredDefault;
        }

        if (typeof allowOverride === 'boolean') {
            settings.allowLocaleOverride = allowOverride;
        }
    } catch (e) {
        // Fallback to defaults when config key is not available.
    }

    if (!settings.supportedLocales.includes(settings.defaultLocale)) {
        settings.supportedLocales = dedupeLocales([...settings.supportedLocales, settings.defaultLocale]);
    }

    cachedLocaleSettings = settings;
    return settings;
}

export function clearLocaleCache() {
    cachedLocaleSettings = null;
    cachedResolvedLocale = null;
}

export async function resolveCurrentLocale(): Promise<string> {
    if (cachedResolvedLocale) return cachedResolvedLocale;

    const localeSettings = await getLocaleSettings();
    const overrideLocale = localeSettings.allowLocaleOverride ? getOverrideLocaleFromUrl() : null;
    const userLocale = await getUserLocaleFromDhis2();

    const candidates = [
        overrideLocale,
        userLocale,
        getLanguagePart(userLocale),
        localeSettings.defaultLocale,
        DEFAULT_LOCALE,
    ];

    for (const candidate of candidates) {
        const normalized = normalizeLocale(candidate);
        if (!normalized) continue;

        if (localeSettings.supportedLocales.includes(normalized)) {
            cachedResolvedLocale = normalized;
            return normalized;
        }

        const languagePart = getLanguagePart(normalized);
        if (languagePart && localeSettings.supportedLocales.includes(languagePart)) {
            cachedResolvedLocale = languagePart;
            return languagePart;
        }
    }

    cachedResolvedLocale = DEFAULT_LOCALE;
    return DEFAULT_LOCALE;
}
