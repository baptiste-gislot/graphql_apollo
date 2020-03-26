import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();

app.use(cors());

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
  context: async () => ({
    models,
    me: await models.User.findByLogin('baptiste'),
    secret: process.env.SECRET,
  }),
});

const eraseDatabaseOnSync = true;

server.applyMiddleware({ app, path: '/graphql' });

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }

  app.listen({ port: 8000}, () => {
    console.log('Le serveur Apollo écoute sur http://localhost:8000/graphql');
  });
});

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'baptiste',
      email: 'baptiste.gislot@gmail.com',
      password: 'tototata',
      messages: [
        {
          text: 'J\'essaie de finir ce tuto',
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
        },
        {
          text: 'J\'aime le chocolat'
        },
      ],
    },
    {
      include: [models.Message],
    }
  );
}