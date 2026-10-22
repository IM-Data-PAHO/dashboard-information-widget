import React from 'react';
import Typography from '@material-ui/core/Typography';
import { t } from '../../shared/services/i18n.service';

export default function DhisVersionError({ version }) {
    return (
        <React.Fragment>
            <Typography>
                <p>
                    <strong>{t('version_error_title', 'Version Error')}</strong> {t('version_error_body', 'This dashboard widget can only be run on dhis2 versions 2.31 and up')}
                </p>
                <p>
                    {t('version_error_current', 'Current version:')} <strong>{version}</strong>
                </p>
            </Typography>
        </React.Fragment>
    );
}
