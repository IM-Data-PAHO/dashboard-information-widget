const fs = require('fs');
const path = require('path');

const platformDir = path.resolve(__dirname, '..');
const bundleDir = path.join(platformDir, 'build', 'bundle');
const target = path.resolve(platformDir, '..', 'dashboard-information-widget-v42.zip');

const zips = fs.existsSync(bundleDir) ? fs.readdirSync(bundleDir).filter((f) => f.endsWith('.zip')) : [];
if (zips.length !== 1) {
    console.error(`[copy-zip] Expected exactly one zip in ${bundleDir}, found ${zips.length}`);
    process.exit(1);
}

fs.copyFileSync(path.join(bundleDir, zips[0]), target);
console.log(`[copy-zip] ${zips[0]} -> ${path.relative(process.cwd(), target)}`);
