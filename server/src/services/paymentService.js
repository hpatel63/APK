import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

export async function tokenizeCard({ cardNumber, expiry, cvc }) {
  return {
    token: `tok_${uuid()}`,
    last4: cardNumber.slice(-4),
    brand: 'VISA',
    expiry,
    createdAt: dayjs().toISOString(),
  };
}

export async function createCashAppRequest({ amount, currency, cashTag }) {
  return {
    id: uuid(),
    amount,
    currency,
    cashTag,
    qrCode: `https://cash.app/qr/${uuid()}`,
    status: 'pending',
    createdAt: dayjs().toISOString(),
  };
}

export async function capturePayment({ token, amount }) {
  return {
    id: `txn_${uuid()}`,
    token,
    amount,
    status: 'captured',
    capturedAt: dayjs().toISOString(),
  };
}

export async function refundPayment({ transactionId, amount }) {
  return {
    id: `refund_${uuid()}`,
    transactionId,
    amount,
    status: 'refunded',
    refundedAt: dayjs().toISOString(),
  };
}
