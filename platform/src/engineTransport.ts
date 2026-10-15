import type { useDataEngine } from '@dhis2/app-runtime';
import type { ApiTransport } from './shared/modules/shared/services/api.service';

type DataEngine = ReturnType<typeof useDataEngine>;

function toRequest(url: string) {
    const [path, query = ''] = url.split('?');
    const params: Record<string, string | string[]> = {};
    new URLSearchParams(query).forEach((value, key) => {
        const existing = params[key];
        params[key] = existing === undefined ? value : ([] as string[]).concat(existing, value);
    });
    return { resource: path.replace(/^\//, ''), params };
}

// The shared code expects HTTP error bodies to be returned (as the legacy fetch
// transport does) rather than thrown; only network failures propagate.
function errorBody(error: any) {
    if (error?.type !== 'network' && error?.details && typeof error.details === 'object') {
        return error.details;
    }
    throw error;
}

export function createEngineTransport(engine: DataEngine): ApiTransport {
    return {
        async get(url) {
            const { resource, params } = toRequest(url);
            try {
                const { result } = await engine.query({ result: { resource, params } });
                return result;
            } catch (error) {
                return errorBody(error);
            }
        },

        saveData(url, data, method) {
            const { resource, params } = toRequest(url);
            return engine.mutate({
                resource,
                params,
                data,
                type: method === 'POST' ? 'create' : 'replace',
            });
        },
    };
}
