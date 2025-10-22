import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Reservation {
    id: ID!
    propertyId: ID!
    roomId: ID!
    guestId: ID!
    status: String!
    checkIn: String!
    checkOut: String!
    totalAmount: Float!
    balance: Float!
    ratePlan: String
    channel: String
  }

  type Query {
    reservations(propertyId: ID): [Reservation]!
  }
`);

export function createRootResolver(db) {
  return {
    reservations: async ({ propertyId }) => {
      const filterValue = propertyId ?? null;
      return db.all(
        `SELECT * FROM reservations WHERE isDeleted = 0 AND (? IS NULL OR propertyId = ?)`,
        [filterValue, filterValue]
      );
    },
  };
}
