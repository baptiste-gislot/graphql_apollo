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
  context: async () => ({
    models,
    me: await models.User.findByLogin('baptiste'),
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