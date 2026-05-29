import React from 'react';
import { t } from '../../shared/services/i18n.service';

export default function NetworkError(props) {
    return (
        <React.Fragment>
            <strong>{t('network_error_title', 'Network Error')}</strong> {t('network_error_body', 'Please check your internet connection')}
        </React.Fragment>
    );
}
