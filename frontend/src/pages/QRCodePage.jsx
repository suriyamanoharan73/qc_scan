import { QRCodeCanvas } from "qrcode.react";

const FRONTEND_URL = "http://localhost:5173";

function QRCodePage() {
  const uploadPageLink = `${FRONTEND_URL}/`;

  return (
    <div className="qr-page">
      <h1>Scan QR to Upload Wish</h1>

      <div className="qr-container">
        <div className="qr-card">
          <h2>Upload Wish</h2>
          <QRCodeCanvas value={uploadPageLink} size={240} />
          <p>{uploadPageLink}</p>
        </div>
      </div>
    </div>
  );
}

export default QRCodePage;