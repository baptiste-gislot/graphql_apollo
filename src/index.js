import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import http from 'http';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();

app.use(cors());

const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (error) {
      throw new AuthenticationError('Votre session a expiré, veuillez vous reconnecter.');
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error:', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret: process.env.SECRET,   
      };
    }
  },
});

const eraseDatabaseOnSync = true;

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages(new Date());
  }

  httpServer.listen({ port: 8000}, () => {
    console.log('Le serveur Apollo écoute sur http://localhost:8000/graphql');
  });
});

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: 'baptiste',
      email: 'baptiste.gislot@gmail.com',
      password: 'tototata',
      role: 'ADMIN',
      messages: [
        {
          text: 'I\'m gonna make it !',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );

  await models.User.create(
    {
      username: 'flora',
      email: 'floleguede@gmail.com',
      password: 'tototata',
      messages: [
        {
          text: 'Je lis des livres',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'J\'aime le chocolat',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    }
  );
}