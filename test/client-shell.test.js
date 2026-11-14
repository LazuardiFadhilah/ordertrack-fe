import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readClientFile = (relativePath) => fs.readFileSync(path.join(clientRoot, relativePath), 'utf8');

test('root shell keeps its accessible, empty-state foundation', () => {
  const layout = readClientFile('app/layout.js');
  const page = readClientFile('app/page.js');
  const styles = readClientFile('app/globals.css');

  assert.match(layout, /<html lang="en">/);
  assert.match(page, /<aside aria-label="Application navigation"/);
  assert.match(page, /<main id="main-content"/);
  assert.match(page, /Skip to main content/);
  assert.match(page, /No operational data loaded/);
  assert.match(styles, /\*\s*\{\s*border-radius: 0;/);
  assert.match(styles, /:focus-visible\s*\{[\s\S]*outline: 3px solid/);
});
