import { baseUrl } from './apiUrl.service';

export interface ApiTransport {
    get(url: string): Promise<any>;
    saveData(url: string, data: any, method: 'POST' | 'PUT'): Promise<any>;
}

const fetchTransport: ApiTransport = {
    get(url) {
        return fetch(baseUrl + url, { credentials: 'include' }).then((resp) => resp.json());
    },

    saveData(url, data, method) {
        return fetch(baseUrl + url, {
            credentials: 'include',
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then((resp) => {
            if (resp.ok) {
                return resp.json();
            } else {
                throw new Error('HTTP Reqest error');
            }
        });
    },
};

let transport: ApiTransport = fetchTransport;

// Lets a host (e.g. the App Platform build) provide its own HTTP layer.
export function setApiTransport(next: ApiTransport) {
    transport = next;
}

export default class Api {
    static get(url) {
        return transport.get(url);
    }

    static saveData(url, data, method: 'POST' | 'PUT') {
        return transport.saveData(url, data, method);
    }

    static post(url, data) {
        return this.saveData(url, data, 'POST');
    }

    static put(url, data) {
        return this.saveData(url, data, 'PUT');
    }
}

export function formatParams(params) {
    const result: string[] = [];
    for (const key in params) {
        if (Array.isArray(params[key])) {
            for (const keyVal of params[key]) {
                result.push(`${key}=${keyVal}`);
            }
        } else {
            result.push(`${key}=${params[key]}`);
        }
    }
    return result.join('&');
}
