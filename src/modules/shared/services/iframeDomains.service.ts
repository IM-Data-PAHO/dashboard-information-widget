// Servicio para obtener y cachear los dominios permitidos de iframes desde DataStore
import api from './api.service';
import config from '../../../config/config.json';

const DEFAULT_IFRAME_DOMAINS = [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'player.vimeo.com',
    'www.loom.com',
    'www.dailymotion.com',
    'player.dailymotion.com',
    'fast.wistia.net',
];

const ALLOWED_IFRAME_DOMAINS_KEY = 'Allowed iframe domains';

let cachedDomains: string[] | null = null;

function normalizeDomain(value: string): string | null {
    if (!value || typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const withProtocol = /^https?:\/\//i.test(trimmed)
            ? trimmed
            : `https://${trimmed}`;
        const hostname = new URL(withProtocol).hostname.toLowerCase();
        return hostname.replace(/^www\./, '');
    } catch (_e) {
        return null;
    }
}

function normalizeDomainList(values: string[]): string[] {
    const normalized = values
        .map(normalizeDomain)
        .filter((v): v is string => Boolean(v));
    return Array.from(new Set(normalized));
}

async function upsertConfigurationWithAllowedDomains(defaultDomains: string[]) {
    const configurationPath = `/dataStore/${config.datastoreNamespace}/configuration`;
    try {
        const configuration = await api.get(configurationPath);
        if (configuration && typeof configuration === 'object') {
            const merged = {
                ...configuration,
                [ALLOWED_IFRAME_DOMAINS_KEY]: defaultDomains,
            };
            await api.put(configurationPath, merged);
            return;
        }
    } catch (_e) {
        // If GET/PUT of configuration fails, fallback to POST create below.
    }

    const fallbackConfiguration = {
        [config.onlyOpenToSuperUsersKey]: false,
        [ALLOWED_IFRAME_DOMAINS_KEY]: defaultDomains,
    };
    await api.post(configurationPath, fallbackConfiguration);
}

export async function getAllowedIframeDomains() {
    if (cachedDomains) return cachedDomains;

    const normalizedDefaults = normalizeDomainList(DEFAULT_IFRAME_DOMAINS);

    // Primary source: dashboard-information/configuration['Allowed iframe domains']
    try {
        const configuration = await api.get(`/dataStore/${config.datastoreNamespace}/configuration`);
        const configuredDomains = configuration?.[ALLOWED_IFRAME_DOMAINS_KEY];
        if (Array.isArray(configuredDomains) && configuredDomains.length > 0) {
            cachedDomains = normalizeDomainList(configuredDomains as string[]);
            return cachedDomains;
        }
    } catch (_e) {
        // Continue with compatibility fallback.
    }

    // Compatibility fallback: previous standalone key.
    try {
        const legacyValue = await api.get(`/dataStore/${config.datastoreNamespace}/allowedIframeDomains`);
        if (Array.isArray(legacyValue) && legacyValue.length > 0) {
            cachedDomains = normalizeDomainList(legacyValue as string[]);
            return cachedDomains;
        }
    } catch (_e) {
        // Continue to creation/default flow.
    }

    // If nothing exists, create/update configuration key with defaults.
    try {
        await upsertConfigurationWithAllowedDomains(normalizedDefaults);
    } catch (e) {
        console.error('No se pudo crear/actualizar configuration con dominios permitidos de iframe.', e);
    }

    cachedDomains = normalizedDefaults;
    return cachedDomains;
}

export async function ensureAllowedIframeDomainsKey() {
    await getAllowedIframeDomains();
}
