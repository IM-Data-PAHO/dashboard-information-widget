// Copies the code shared with the legacy (DHIS2 v40) widget into src/shared and
// then overlays the platform-specific files from ./overrides.
const fs = require('fs');
const path = require('path');

const platformDir = path.resolve(__dirname, '..');
const legacySrc = path.resolve(platformDir, '..', 'src');
const out = path.join(platformDir, 'src', 'shared');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

fs.cpSync(path.join(legacySrc, 'modules'), path.join(out, 'modules'), { recursive: true });
fs.cpSync(path.join(legacySrc, 'config'), path.join(out, 'config'), { recursive: true });
fs.copyFileSync(path.join(legacySrc, 'index.css'), path.join(out, 'index.css'));
fs.cpSync(path.join(platformDir, 'overrides'), out, { recursive: true });

console.log('[prepare-shared] Copied shared sources to', path.relative(platformDir, out));
