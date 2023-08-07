import { createSchema } from 'graphql-yoga'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'

export const typeDefs = `
  type Mutation {
    create_movie(title: String!): Success
    create_shareholder(data: ShareholderInput!): Success
    create_transfer(movie_id: String!, amount: Float!, description: String!): Success
  }

  type Success {
    success: Boolean!
    error_message: String
  }

  type Query {
    get_movies: [Movie]!
    get_shareholders(page_size: Int!, cursor: String): [Shareholder]!
    get_shareholder(shareholder_id: String!): Shareholder!
    get_transfers(shareholder_id: String!): Transfers!
  }

  type Transfers {
    transfers: [Transfer]!
    balance: Balance!
  }

  type Balance {
    value: String!
    currency: Currency!
  }

  type Transfer {
    id: ID!
    amount: Float!
    description: String!
    currency: Currency!
    movie_id: String!
    movie: Movie!
  }

  type Movie
  
  enum Currency {
    EUR
  }

  type Movie {
    id: ID!
    title: String!
  }

  input ShareholderInput {
    first_name: String!
    last_name: String!
    address: String!
    iban: String!
    movie_id: String!
  }

  type Shareholder {
    id: String!
    first_name: String!
    last_name: String!
    address: String!
    iban: String!
    movie_id: String!
    movie: Movie!
  }

  scalar DateTime
`

export const resolvers = {
  Query: {
    get_movies: (_parent, _args, context: Context) => {
      return context.prisma.movie.findMany()
    },

    get_shareholders: (
      _parent,
      args: {
        page_size: number
        cursor: string | null
      },
      context: Context,
    ) => {
      return context.prisma.shareholder.findMany({
        take: args.page_size,
        cursor: args.cursor ? { id: args.cursor } : undefined,
        orderBy: { id: 'asc' },
      })
    },

    get_shareholder: (_parent, args: { shareholder_id: string }, context: Context) => {
      return context.prisma.shareholder.findUnique({ where: { id: args.shareholder_id }, include: { movie: true } })
    },
    get_transfers: async (_parent, args: { shareholder_id: string }, context: Context) => {
      const shareholder = await context.prisma.shareholder.findUnique({ where: { id: args.shareholder_id } })

      const numberOfShareholdersPerMovie = await context.prisma.shareholder.count({ where: { movie_id: shareholder?.movie_id } })

      const transfers = await context.prisma.transfer.findMany({ where: { movie_id: shareholder?.movie_id }, include: { movie: true } })


      const transfersPerShareholder = transfers.map(transfer => ({ ...transfer, amount: transfer.amount / numberOfShareholdersPerMovie }))
      const balance = transfersPerShareholder.reduce((total, curr) => {
        return total + curr.amount
      }, 0)
      return { transfers: transfersPerShareholder, balance: { value: balance, currency: transfers[0]?.currency || Currency.EUR } }
    },
  },
  Mutation: {

    create_movie: async (
      _parent,
      args: { title: string },
      context: Context,
    ) => {
      try {
        await context.prisma.movie.create({
          data: {
            title: args.title,
          },
        })
        return { success: true }
      } catch (error) {
        return { success: false, error_message: 'Could not add movie' + args.title }
      }
    },
    create_transfer: async (
      _parent,
      args: { movie_id: string; amount: number; description: string },
      context: Context,
    ) => {
      try {
        await context.prisma.transfer.create({
          data: {
            movie_id: args.movie_id,
            amount: args.amount,
            description: args.description,
          },
        })
        return { success: true }
      } catch (error) {
        return { success: false, error_message: 'Could not add transfer' }
      }
    },
    create_shareholder: async (
      _parent,
      args: { data: Shareholder },
      context: Context,
    ) => {
      try {
        await context.prisma.shareholder.create({
          data: {
            first_name: args.data.first_name,
            last_name: args.data.last_name,
            address: args.data.address,
            iban: args.data.iban,
            movie_id: args.data.movie_id,
          },
        })
        return { success: true }
      } catch (error) {
        // TODO: see if we can return a more precise error message
        return { success: false, error_message: "Shareholder could not be added" }
      }
    },
  },
  DateTime: DateTimeResolver,
}

interface Shareholder {
  first_name: string
  last_name: string
  address: string
  iban: string
  movie_id: string
}

enum Currency {
  EUR = 'EUR'
}

export const schema = createSchema({
  typeDefs,
  resolvers,
})