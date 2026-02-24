import QRCode from 'qrcode';

/**
 * Generate a random 6-digit numeric coupon code.
 */
export function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a QR code as a base64 Data URL.
 * The QR encodes a JSON payload with coupon code, name, and team.
 */
export async function generateQRDataURL(payload: {
    couponCode: string;
    name: string;
    teamName: string;
}): Promise<string> {
    const data = JSON.stringify(payload);
    const dataURL = await QRCode.toDataURL(data, {
        width: 250,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    });
    return dataURL;
}
