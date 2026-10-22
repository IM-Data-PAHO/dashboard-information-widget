import React, { useEffect, useState } from 'react';
import { AlertBar, AlertStack } from '@dhis2/ui';
import config from './shared/config/config.json';
import api from './shared/modules/shared/services/api.service';
import setupNamespace from './shared/modules/shared/services/setupNamespace.service';
import { ensureAllowedIframeDomainsKey } from './shared/modules/shared/services/iframeDomains.service';
import { initI18nLocale } from './shared/modules/shared/services/i18n.service';
import RouterWrapper from './shared/modules/main/components/routerWrapper.component';

const ignore = () => undefined;

async function loadIsAdmin(): Promise<boolean> {
    try {
        const me = await api.get('/me?fields=authorities,userRoles[name]');
        const roles = me?.userRoles || [];
        return (
            (me?.authorities || []).includes('ALL') ||
            roles.some((role) => role?.name?.includes('Superuser') || role?.name?.includes('Administr'))
        );
    } catch (e) {
        return false;
    }
}

async function loadAdminOnlyEdit(): Promise<boolean> {
    try {
        const namespaces = await api.get('/dataStore');
        if (!Array.isArray(namespaces) || !namespaces.includes(config.datastoreNamespace)) return false;
        const configuration = await api.get(`/dataStore/${config.datastoreNamespace}/configuration`);
        return Boolean(configuration?.[config.onlyOpenToSuperUsersKey]);
    } catch (e) {
        return false;
    }
}

export default function PluginRoot() {
    const [ready, setReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminOnlyEdit, setAdminOnlyEdit] = useState(true);
    const [message, setMessage] = useState<{ id: number; text: string } | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            // Creating the namespace first avoids racing the reads below.
            await setupNamespace().catch(ignore);
            const [admin, adminOnly] = await Promise.all([
                loadIsAdmin(),
                loadAdminOnlyEdit(),
                ensureAllowedIframeDomainsKey().catch(ignore),
                initI18nLocale().catch(ignore),
            ]);
            if (cancelled) return;
            setIsAdmin(admin as boolean);
            setAdminOnlyEdit(adminOnly as boolean);
            setReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    if (!ready) return null;

    return (
        <>
            <RouterWrapper
                postMessage={(text: string) => setMessage({ id: Date.now(), text })}
                isAdmin={isAdmin}
                adminOnlyEdit={adminOnlyEdit}
            />
            <AlertStack>
                {message && (
                    <AlertBar key={message.id} duration={3000} onHidden={() => setMessage(null)}>
                        {message.text}
                    </AlertBar>
                )}
            </AlertStack>
        </>
    );
}
