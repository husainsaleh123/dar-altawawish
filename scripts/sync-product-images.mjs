import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'src', 'assets', 'images', 'products');
const targetDir = path.join(projectRoot, 'public', 'products');
const watchMode = process.argv.includes('--watch');

function ensureTargetDir() {
  fs.mkdirSync(targetDir, { recursive: true });
}

function copyFile(filename) {
  if (!filename) return;

  const sourcePath = path.join(sourceDir, filename);
  const targetPath = path.join(targetDir, filename);

  if (!fs.existsSync(sourcePath)) {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true });
      console.log(`[sync-product-images] removed ${filename}`);
    }
    return;
  }

  const sourceStat = fs.statSync(sourcePath);
  const targetStat = fs.existsSync(targetPath) ? fs.statSync(targetPath) : null;

  if (
    targetStat &&
    targetStat.size === sourceStat.size &&
    targetStat.mtimeMs >= sourceStat.mtimeMs
  ) {
    return;
  }

  fs.copyFileSync(sourcePath, targetPath);
  console.log(`[sync-product-images] copied ${filename}`);
}

function syncAll() {
  ensureTargetDir();

  for (const filename of fs.readdirSync(sourceDir)) {
    copyFile(filename);
  }
}

syncAll();

if (watchMode) {
  console.log('[sync-product-images] watching for image changes...');

  let syncTimer = null;
  fs.watch(sourceDir, (eventType, filename) => {
    if (!filename) return;

    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      copyFile(filename);
    }, 50);
  });
}
