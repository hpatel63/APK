import Dexie from 'dexie';

class OfflineDatabase extends Dexie {
  reservations!: Dexie.Table<any, string>;
  constructor() {
    super('auroraOffline');
    this.version(1).stores({
      reservations: 'id, propertyId, roomId'
    });
  }
}

const db = new OfflineDatabase();

export async function persistReservationOffline(payload: any) {
  await db.reservations.put({ ...payload, id: payload.clientId });
}

export async function getOfflineReservations() {
  return db.reservations.toArray();
}

export async function clearReservation(id: string) {
  return db.reservations.delete(id);
}
