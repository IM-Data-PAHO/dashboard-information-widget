import React from 'react';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { fetchContent } from '../shared/services/content.service';
import { sanitize } from '../shared/services/sanitize.service';
import Typography from '@material-ui/core/Typography';
import { debugLog, getIframeDebugInfo } from '../shared/services/debug.service';

const styles = {
    link: {
        float: 'right',
    },
};

export default class Render extends React.Component<
    { isAdmin: boolean; adminOnlyEdit: boolean },
    { contentFetched: boolean; contentBody: string | null; inDashEditMode: boolean; iframeError: string | null }
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
        };
        fetchContent()
            .then(async (resp) => {
                debugLog('render.beforeSanitize', {
                    contentLength: (resp || '').length,
                    iframeInfo: getIframeDebugInfo(resp),
                });
                const { html, iframeError } = await sanitize(resp);
                debugLog('render.afterSanitize', {
                    contentLength: (html || '').length,
                    iframeError,
                    iframeInfo: getIframeDebugInfo(html),
                });
                this.setState({
                    contentFetched: true,
                    contentBody: html,
                    iframeError,
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
                        <b>El contenido intentó mostrar un video o recurso de un dominio no permitido:</b> <code>{this.state.iframeError}</code><br/>
                        Pide a un administrador que lo agregue a la lista de dominios permitidos.
                    </Typography>
                )}
                <div className="dashboard-information-content" dangerouslySetInnerHTML={{ __html: this.state.contentBody }} />
            </>;
        } else if (this.state.contentFetched) return <Typography>New Dashboard Information widget</Typography>;
        else return <Typography></Typography>;
    }
    render() {
        const editable = this.state.inDashEditMode && (this.props.isAdmin || !this.props.adminOnlyEdit);
        return (
            <React.Fragment>
                {editable || process.env.NODE_ENV === 'development' ? (
                    <Link to={`/edit`} style={styles.link}>
                        <Button color="primary">Edit</Button>
                    </Link>
                ) : null}
                {this.renderContent()}
            </React.Fragment>
        );
    }
}
