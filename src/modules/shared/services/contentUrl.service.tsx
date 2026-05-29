const config = require('../../../config/config.json');

const widgetQueryKeys = [
    'dashboardItemId',
    'dashboarditemid',
    'dashboardItemUid',
    'dashboarditemuid',
    'itemId',
    'itemid',
    'uid',
    'id',
];

function getParamFromUrlPart(urlPart: string | null): string | null {
    if (!urlPart) return null;
    const queryIndex = urlPart.indexOf('?');
    if (queryIndex === -1) return null;

    const query = urlPart.slice(queryIndex + 1);
    const params = new URLSearchParams(query);

    for (const key of widgetQueryKeys) {
        const value = params.get(key);
        if (value) return value;
    }

    return null;
}

function getWidgetIdFromWindow(): string | null {
    const candidates = [
        window.location.search,
        window.location.hash,
    ];

    try {
        candidates.push(window.parent.location.search, window.parent.location.hash);
    } catch (e) {
        // Access to parent location can fail in cross-origin contexts.
    }

    for (const part of candidates) {
        const id = getParamFromUrlPart(part);
        if (id) return id;
    }

    return null;
}

export function getWidgetId():string|null{
    if (process.env.NODE_ENV === 'development') {
        return 'devDashUid1';
    } else {
        return getWidgetIdFromWindow();
    }
}

export default function getContentUrl() {
    const widgetId = getWidgetId();
    if (!widgetId) {
        throw new Error('Cannot resolve dashboard widget id from URL parameters.');
    }
    return `/dataStore/${config.datastoreNamespace}/${widgetId}`;
}
