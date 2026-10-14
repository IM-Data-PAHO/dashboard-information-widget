import React from 'react';
import { t } from '../../shared/services/i18n.service';

export default function StandaloneNotice() {
    return (
        <div style={{ padding: 16 }}>
            <strong>{t('standalone_title')}</strong>
            <p>{t('standalone_body')}</p>
        </div>
    );
}
