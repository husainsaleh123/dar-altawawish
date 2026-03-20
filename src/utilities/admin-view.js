export function formatAdminDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-BH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAdminPrice(value) {
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    maximumFractionDigits: 3,
  }).format(Number(value) || 0);
}

export function getAdminUserDisplayName(user) {
  return user?.name || user?.customer?.fullName || "Unknown";
}
