// ./src/utilities/users-api.js

import sendRequest from './send-request';

const BASE_URL = '/api/users';

export function signUp(userData) {
  return sendRequest(`${BASE_URL}/signup`, 'POST', userData);
}

export function login(credentials) {
  return sendRequest(`${BASE_URL}/login`, 'POST', credentials);
}

export function googleAuth(payload) {
  return sendRequest(`${BASE_URL}/google`, 'POST', payload, { includeToken: false });
}

export function getGoogleConfig() {
  return sendRequest(`${BASE_URL}/google/config`, 'GET', null, { includeToken: false });
}

export function getProfile() {
  return sendRequest(`${BASE_URL}/profile`);
}

export function updatePassword(passwordData) {
  return sendRequest(`${BASE_URL}/password`, 'PUT', passwordData);
}
