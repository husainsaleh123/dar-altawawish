import crypto from 'crypto';

const APS_SANDBOX_PAYMENT_PAGE = 'https://sbcheckout.payfort.com/FortAPI/paymentPage';
const APS_SANDBOX_API = 'https://sbpaymentservices.payfort.com/FortAPI/paymentApi';

function getEnv(name) {
  return String(process.env[name] || '').trim();
}

export function getApsConfig() {
  return {
    accessCode: getEnv('APS_ACCESS_CODE'),
    merchantIdentifier: getEnv('APS_MERCHANT_IDENTIFIER'),
    shaRequestPhrase: getEnv('APS_SHA_REQUEST_PHRASE'),
    shaResponsePhrase: getEnv('APS_SHA_RESPONSE_PHRASE'),
    shaType: (getEnv('APS_SHA_TYPE') || 'SHA-256').toUpperCase()
  };
}

export function isApsConfigured() {
  const config = getApsConfig();
  return Boolean(
    config.accessCode
      && config.merchantIdentifier
      && config.shaRequestPhrase
      && config.shaResponsePhrase
      && config.shaType
  );
}

export function getAppBaseUrl(req) {
  const configuredBaseUrl = getEnv('APP_BASE_URL');
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  return `${protocol}://${host}`;
}

export function getApsHostedCheckoutUrl() {
  return APS_SANDBOX_PAYMENT_PAGE;
}

export function buildApsHostedCheckoutPayload(params) {
  const config = getApsConfig();
  const payload = {
    command: 'PURCHASE',
    access_code: config.accessCode,
    merchant_identifier: config.merchantIdentifier,
    merchant_reference: params.merchantReference,
    amount: String(params.amount),
    currency: params.currency,
    language: params.language || 'en',
    customer_email: params.customerEmail,
    customer_name: params.customerName,
    phone_number: params.phoneNumber,
    return_url: params.returnUrl,
    order_description: params.orderDescription,
    eci: 'ECOMMERCE',
    remember_me: 'NO',
    merchant_extra: params.orderId,
    merchant_extra1: params.orderNumber
  };

  payload.signature = generateApsSignature(payload, config.shaRequestPhrase, config.shaType);
  return payload;
}

export function verifyApsResponseSignature(params) {
  const { signature = '', ...rest } = params || {};
  const config = getApsConfig();
  const expectedSignature = generateApsSignature(rest, config.shaResponsePhrase, config.shaType);
  return String(signature || '').toUpperCase() === expectedSignature.toUpperCase();
}

export async function checkApsPaymentStatus({ merchantReference, fortId }) {
  const config = getApsConfig();
  const payload = {
    query_command: 'CHECK_STATUS',
    access_code: config.accessCode,
    merchant_identifier: config.merchantIdentifier,
    merchant_reference: merchantReference,
    language: 'en'
  };

  if (fortId) {
    payload.fort_id = fortId;
  }

  payload.signature = generateApsSignature(payload, config.shaRequestPhrase, config.shaType);

  const response = await fetch(APS_SANDBOX_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.response_message || 'APS status check failed.');
  }

  return data;
}

function generateApsSignature(params, phrase, shaType) {
  const filteredEntries = Object.entries(params || {})
    .filter(([key, value]) => key !== 'signature' && value !== undefined && value !== null);

  const sortedPayload = filteredEntries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('');

  const stringToHash = `${phrase}${sortedPayload}${phrase}`;
  return crypto
    .createHash(normalizeHashAlgorithm(shaType))
    .update(stringToHash, 'utf8')
    .digest('hex');
}

function normalizeHashAlgorithm(shaType) {
  if (shaType === 'SHA-512') return 'sha512';
  if (shaType === 'SHA-256') return 'sha256';
  return 'sha256';
}
