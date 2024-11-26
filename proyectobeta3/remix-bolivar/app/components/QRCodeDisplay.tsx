import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  text: string;
  size?: number;
}

export default function QRCodeDisplay({ text, size = 200 }: QRCodeDisplayProps) {
  return (
    <div className="flex justify-center">
      <QRCodeSVG
        value={text}
        size={size}
        level="H"
        includeMargin
        className="border p-2 rounded"
      />
    </div>
  );
} 