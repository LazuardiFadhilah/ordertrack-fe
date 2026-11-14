const GENERIC_AUTH_ERROR = 'Unable to sign in. Check your email and password and try again.';

async function readResponse(response) {
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || body?.success === false) {
    const error = new Error(response.status === 400 || response.status === 401 ? GENERIC_AUTH_ERROR : 'The authentication service is unavailable. Try again.');
    error.status = response.status;
    error.details = body;
    throw error;
  }

  return body?.data ?? null;
}

export function validateLogin({ email, password }) {
  const errors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';

  return errors;
}

export async function login({ email, password }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return readResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  return (await readResponse(response))?.user;
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  return readResponse(response);
}

export { GENERIC_AUTH_ERROR };
