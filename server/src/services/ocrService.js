import { v4 as uuid } from 'uuid';

export async function scanId(buffer) {
  return {
    id: uuid(),
    firstName: 'Sample',
    lastName: 'Guest',
    documentNumber: 'D12345678',
    expiry: '2030-12-31',
  };
}
