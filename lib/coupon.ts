/**
 * Generate a random 6-digit numeric coupon code.
 */
export function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a QR code URL using a hosted service.
 * Email clients (Gmail, Outlook, etc.) block base64 data URLs in <img> tags,
 * so we use api.qrserver.com to get a real hosted image URL.
 * The QR encodes a JSON payload with the unique registration ID and coupon code.
 */
export function generateQRCodeURL(payload: {
    id: string;
    couponCode: string;
}): string {
    const data = JSON.stringify(payload);
    const encoded = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
}
