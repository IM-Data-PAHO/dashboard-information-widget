import React from 'react';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { fetchContentDetails } from '../shared/services/content.service';
import { sanitize } from '../shared/services/sanitize.service';
import Typography from '@material-ui/core/Typography';
import { debugLog, getIframeDebugInfo } from '../shared/services/debug.service';
import { t, getCurrentLocale } from '../shared/services/i18n.service';

const styles = {
    link: {
        float: 'right',
    },
};

export default class Render extends React.Component<
    { isAdmin: boolean; adminOnlyEdit: boolean },
    {
        contentFetched: boolean;
        contentBody: string | null;
        inDashEditMode: boolean;
        iframeError: string | null;
        selectedLocale: string | null;
        requestedLocale: string | null;
        fallbackUsed: boolean;
    }
> {
    getInDashEditMode() {
        try {
            const hash = window.parent.location.hash || '';
            return hash.includes('edit') || hash.includes('new');
        } catch (e) {
            return false;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            contentFetched: false,
            contentBody: null,
            inDashEditMode: this.getInDashEditMode(),
            iframeError: null,
            selectedLocale: null,
            requestedLocale: getCurrentLocale(),
            fallbackUsed: false,
        };
        fetchContentDetails(getCurrentLocale())
            .then(async (resp) => {
                debugLog('render.beforeSanitize', {
                    contentLength: (resp?.body || '').length,
                    requestedLocale: resp?.requestedLocale,
                    selectedLocale: resp?.selectedLocale,
                    fallbackUsed: resp?.fallbackUsed,
                    iframeInfo: getIframeDebugInfo(resp?.body || ''),
                });
                const { html, iframeError } = await sanitize(resp?.body || '');
                debugLog('render.afterSanitize', {
                    contentLength: (html || '').length,
                    iframeError,
                    iframeInfo: getIframeDebugInfo(html),
                });
                this.setState({
                    contentFetched: true,
                    contentBody: html,
                    iframeError,
                    selectedLocale: resp?.selectedLocale,
                    requestedLocale: resp?.requestedLocale,
                    fallbackUsed: Boolean(resp?.fallbackUsed),
                });
            })
            .catch((err) => {
                console.log('Error fetching dash content');
            });
    }
    renderContent() {
        if (this.state.contentBody) {
            return <>
                {this.state.iframeError && (
                    <Typography color="error" style={{ marginBottom: 8 }}>
                        <b>{t('iframe_domain_blocked_title', 'The content tried to display a video or resource from a non-allowed domain:')}</b> <code>{this.state.iframeError}</code><br/>
                        {t('iframe_domain_blocked_help', 'Ask an administrator to add it to the allowed domains list.')}
                    </Typography>
                )}
                {this.state.fallbackUsed && this.state.selectedLocale && (
                    <Typography style={{ marginBottom: 8 }}>
                        {t('fallback_notice', 'Showing fallback content in {locale}.', {
                            locale: this.state.selectedLocale,
                        })}
                    </Typography>
                )}
                <div className="dashboard-information-content" dangerouslySetInnerHTML={{ __html: this.state.contentBody }} />
            </>;
        } else if (this.state.contentFetched) return <Typography>{t('no_content_placeholder', 'New Dashboard Information widget')}</Typography>;
        else return <Typography></Typography>;
    }
    render() {
        const editable = this.state.inDashEditMode && (this.props.isAdmin || !this.props.adminOnlyEdit);
        return (
            <React.Fragment>
                {editable || process.env.NODE_ENV === 'development' ? (
                    <Link to={`/edit`} style={styles.link}>
                        <Button color="primary">{t('edit', 'Edit')}</Button>
                    </Link>
                ) : null}
                {this.renderContent()}
            </React.Fragment>
        );
    }
}
