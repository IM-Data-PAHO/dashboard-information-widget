/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    name: 'Information',
    title: 'Information',
    description: 'Rich text and video widget for DHIS2 dashboards',
    pluginType: 'DASHBOARD',
    dataStoreNamespace: 'dashboard-information',
    entryPoints: {
        app: './src/App.tsx',
        plugin: './src/Plugin.tsx',
    },
}

module.exports = config
