import QRScannerView from '@/components/scanner/QRScannerView';

export const metadata = {
    title: 'Scan Coupon — IEDC Food Coupon',
    description: 'Scan QR codes to verify food coupons',
};

export default function ScanPage() {
    return <QRScannerView />;
}
