import { gql } from 'apollo-server-express';

export const typeDefs = gql`
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
    reservations(propertyId: ID): [Reservation]
  }
`;

export function resolvers(db) {
  return {
    Query: {
      reservations: async (_, { propertyId }) => {
        return db.all(`SELECT * FROM reservations WHERE isDeleted = 0 AND (? IS NULL OR propertyId = ?)`, [propertyId || null, propertyId || null]);
      },
    },
  };
}
