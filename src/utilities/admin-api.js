import sendRequest from "./send-request";

const BASE_URL = "/api/admin";

export function getAdminOrders() {
  return sendRequest(`${BASE_URL}/orders`);
}

export function updateAdminOrder(orderId, payload) {
  return sendRequest(`${BASE_URL}/orders/${orderId}`, "PATCH", payload);
}

export function getAdminUsers() {
  return sendRequest(`${BASE_URL}/users`);
}

export function updateAdminUser(userId, payload) {
  return sendRequest(`${BASE_URL}/users/${userId}`, "PATCH", payload);
}

export function getAdminProducts() {
  return sendRequest(`${BASE_URL}/products`);
}

export function updateAdminProduct(productId, payload) {
  return sendRequest(`${BASE_URL}/products/${productId}`, "PATCH", payload);
}

export function getAdminNotifications() {
  return sendRequest(`${BASE_URL}/notifications`);
}

export function markAdminNotificationRead(notificationId) {
  return sendRequest(`${BASE_URL}/notifications/${notificationId}/read`, "PATCH");
}
