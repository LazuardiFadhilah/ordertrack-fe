import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { getCurrentUser, login, logout, validateLogin } from '../app/auth-client.js';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readClientFile = (relativePath) => fs.readFileSync(path.join(clientRoot, relativePath), 'utf8');

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('root shell keeps its accessible, empty-state foundation', () => {
  const layout = readClientFile('app/layout.js');
  const page = readClientFile('app/page.js');
  const styles = readClientFile('app/globals.css');

  assert.match(layout, /<html lang="en">/);
  assert.match(page, /<aside aria-label="Application navigation"/);
  assert.match(page, /aria-controls="mobile-navigation"/);
  assert.match(page, /aria-expanded=\{isMobileNavOpen\}/);
  assert.match(page, /aria-labelledby="mobile-navigation-title"/);
  assert.match(page, /key === 'Escape'/);
  assert.match(page, /Close navigation backdrop/);
  assert.match(page, /<main id="main-content"/);
  assert.match(page, /Skip to main content/);
  assert.match(page, /No operational data loaded/);
  assert.match(page, /components\/ui\/button/);
  assert.match(page, /rounded-(md|lg)/);
  assert.doesNotMatch(styles, /border-radius:\s*0/);
  assert.match(styles, /:focus-visible\s*\{[\s\S]*outline: 3px solid/);
});

test('login posts the exact auth payload with same-origin cookie credentials', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ success: true, data: { user: { id: 'user-1', name: 'Demo User', email: 'sales@example.test', role: 'SALES' } } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const result = await login({ email: 'sales@example.test', password: 'dummy-password' });

  assert.deepEqual(result.user, { id: 'user-1', name: 'Demo User', email: 'sales@example.test', role: 'SALES' });
  assert.equal(request.url, '/api/auth/login');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.credentials, 'include');
  assert.equal(request.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.options.body), { email: 'sales@example.test', password: 'dummy-password' });
});

test('login validation rejects empty and malformed fields before a request', () => {
  assert.deepEqual(validateLogin({ email: '', password: '' }), {
    email: 'Enter your email address.',
    password: 'Enter your password.',
  });
  assert.deepEqual(validateLogin({ email: 'not-an-email', password: 'dummy-password' }), {
    email: 'Enter a valid email address.',
  });
});

test('login uses a generic message for invalid credentials', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Email not found', errors: [] }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });

  await assert.rejects(login({ email: 'unknown@example.test', password: 'wrong' }), (error) => {
    assert.equal(error.status, 401);
    assert.equal(error.message, 'Unable to sign in. Check your email and password and try again.');
    return true;
  });
});

test('auth client preserves unauthorized status for the protected shell check', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Authentication required', errors: [] }), { status: 401, headers: { 'content-type': 'application/json' } });
  await assert.rejects(getCurrentUser(), (error) => error.status === 401);
});

test('logout posts to the contracted endpoint with cookie credentials', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ success: true, data: null }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  await logout();

  assert.equal(request.url, '/api/auth/logout');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.credentials, 'include');
});
