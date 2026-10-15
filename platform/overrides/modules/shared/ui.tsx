import React from 'react';
import { Button as D2Button } from '@dhis2/ui';

// Maps the Material-UI style props used by the shared components to @dhis2/ui.
export function Button({ variant, onClick, style, children }: any) {
    return (
        <span style={style}>
            <D2Button primary={variant === 'contained'} secondary={variant !== 'contained'} onClick={onClick}>
                {children}
            </D2Button>
        </span>
    );
}

export function Typography({ color, style, children }: any) {
    return <p style={{ margin: 0, color: color === 'error' ? '#d32f2f' : undefined, ...style }}>{children}</p>;
}
