// ./utilities/send-request.js

import { getToken } from './users-service';

export default async function sendRequest(url, method = 'GET', payload = null, options = {}) {
  const { includeToken = true } = options;
  // Fetch takes an optional options object as the 2nd argument
  // used to include a data payload, set headers, etc.
  const requestOptions = { method };
  if (payload) {
    requestOptions.headers = { 'Content-Type': 'application/json' };
    requestOptions.body = JSON.stringify(payload);
  }
  if (includeToken) {
    const token = getToken();
    if (token) {
      // Ensure headers object exists
      requestOptions.headers = requestOptions.headers || {};
      // Add token to an Authorization header
      // Prefacing with 'Bearer' is recommended in the HTTP specification
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }
  }
  const res = await fetch(url, requestOptions);
  // res.ok will be false if the status code set to 4xx in the controller action
  if (res.ok) return res.json();

  let message = 'Bad Request';
  try {
    const data = await res.json();
    message = data?.error || data?.message || message;
  } catch {
    // ignore parsing errors
  }
  throw new Error(message);
}
