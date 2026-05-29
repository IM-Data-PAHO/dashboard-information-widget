import api from './api.service';
import { getKeyUid, shareKey } from './content.service';

const config = require('../../../config/config.json');

function getDefaultConfiguration() {
    return {
        [config.onlyOpenToSuperUsersKey]: false,
        [config.defaultLocaleConfigKey]: 'en',
        [config.supportedLocalesConfigKey]: ['en', 'es', 'fr'],
        [config.allowLocaleOverrideConfigKey]: true,
    };
}

async function addNamespaceConfig(datastoreNamespace) {
    const data = getDefaultConfiguration();
    await api.post(`/dataStore/${datastoreNamespace}/configuration`, data);
    //Share configuration key so only superusers can edit
    const configKeyUid = await getKeyUid('configuration');
    await shareKey(configKeyUid, 'r-------');
}

async function ensureConfigurationDefaults(datastoreNamespace) {
    const configurationPath = `/dataStore/${datastoreNamespace}/configuration`;
    const defaults = getDefaultConfiguration();

    try {
        const existing = await api.get(configurationPath);
        if (!existing || typeof existing !== 'object') {
            await api.put(configurationPath, defaults);
            return;
        }

        const merged = { ...defaults, ...existing };
        const changed = JSON.stringify(merged) !== JSON.stringify(existing);
        if (changed) {
            await api.put(configurationPath, merged);
        }
    } catch (e) {
        await api.post(configurationPath, defaults);
    }
}

export default async function setupNamespace() {
    const { datastoreNamespace } = config;
    const namespaces = await api.get('/dataStore');
    if (!namespaces.includes(datastoreNamespace)) {
        // Namespace does not yet exist
        console.log(`Setting up namespace ${datastoreNamespace}`);
        await addNamespaceConfig(datastoreNamespace);
    } else {
        const namespaceKeys = await api.get(`/dataStore/${config.datastoreNamespace}`);
        if (!namespaceKeys.includes('configuration')) {
            // Namespace exists, but no config key (upgrading from old app version)
            await addNamespaceConfig(datastoreNamespace);
        } else {
            await ensureConfigurationDefaults(datastoreNamespace);
        }
    }
}
