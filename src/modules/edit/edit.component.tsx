import React from 'react';
import { fetchContent, saveContent } from '../shared/services/content.service';
import { Button } from '@material-ui/core';
import { Link, withRouter } from 'react-router-dom';
import Editor from './editor.component';
import contentHook from '../shared/services/contentHook.service';
import { debugLog, getIframeDebugInfo } from '../shared/services/debug.service';

const styles = {
    link: {
        float: 'right',
    },
    clear: {
        clear: 'both',
        height: 20,
    },
    readmeLink: {
        float: 'left',
        fontFamily: 'Roboto',
        fontSize: '0.9rem',
        paddingLeft: '5px',
    },
};

class Edit extends React.Component<
    { postMessage: any; history: any },
    {
        originalContent?: string;
        editedContent?: string;
    }
> {
    constructor(props) {
        super(props);
        this.state = {};
        fetchContent().then((resp) => {
            debugLog('edit.loadContent', {
                contentLength: (resp || '').length,
                iframeInfo: getIframeDebugInfo(resp),
            });
            this.setState({
                editedContent: resp,
            });
        });
    }
    onChange = (newContent) => {
        debugLog('edit.onChange', {
            contentLength: (newContent || '').length,
            iframeInfo: getIframeDebugInfo(newContent),
        });
        this.setState({ editedContent: newContent });
    };

    saveChanges = () => {
        const hookedContent = contentHook(this.state.editedContent);
        debugLog('edit.beforeSave', {
            contentLength: (hookedContent || '').length,
            iframeInfo: getIframeDebugInfo(hookedContent),
        });

        saveContent(hookedContent)
            .then((resp) => {
                this.props.postMessage('Content saved');
                this.props.history.push('/');
            })
            .catch((e) => {
                this.props.postMessage('Error: Cannot save');
            });
    };

    render() {
        return (
            <React.Fragment>
                <p style={styles.readmeLink as any}>
                    <i>
                        <a
                            href="https://github.com/pepfar-datim/dashboard-information-widget/blob/main/README.md"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Documentation for the Dashboard Information widget can be found here.
                        </a>
                    </i>
                </p>
                <Link to={`/`} style={styles.link}>
                    <Button>Cancel</Button>
                </Link>
                <Button onClick={this.saveChanges} variant="contained" color="secondary" style={styles.link as any}>
                    Save
                </Button>
                <div style={styles.clear as any} />
                <Editor content={this.state.editedContent} onChange={this.onChange} />
            </React.Fragment>
        );
    }
}

export default withRouter(Edit);
