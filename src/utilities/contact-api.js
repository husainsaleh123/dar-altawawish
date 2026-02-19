import sendRequest from './send-request';

const BASE_URL = '/api/contact';

export function submitContactForm(payload) {
  return sendRequest(BASE_URL, 'POST', payload, { includeToken: false });
}
