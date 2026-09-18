import { QRCodeSVG } from 'qrcode.react';
import './LoyaltyCard.css';

export default function LoyaltyCard({ name = 'Марина', tier = 'SILVER', cashback = 5, balance = 0, clientCode = 'demo-client-0001' }) {
  return (
    <div className="loyalty-card">
      <div className="loyalty-top">
        <div>
          <div className="loyalty-tier">{tier} · {cashback}% кешбек</div>
          <div className="loyalty-name">{name}</div>
        </div>
        <div className="loyalty-qr-badge">
          <QRCodeSVG value={`salon-app://client/${clientCode}`} size={40} bgColor="#ffffff" fgColor="#17161A" level="M" />
        </div>
      </div>
      <div className="loyalty-balance-row">
        <span className="loyalty-balance">{balance}</span>
        <span className="loyalty-balance-label">бонусов на счету</span>
      </div>
    </div>
  );
}
