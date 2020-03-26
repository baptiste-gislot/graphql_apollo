import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) => {
  me ? skip : new ForbiddenError('Vous n\'êtes pas authentifié.');
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) => {
    role === 'ADMIN' 
      ? skip 
      : new ForbiddenError('Vous n\'êtes pas admin.');
  }
);

export const isMessageOwner = async (parent, { id }, { models, me }) => {
  const message = await models.Message.findByPk(id, { raw: true });

  if (message.userId !== me.id) {
    throw new ForbiddenError('Vous n\'êtes pas l\'auteur de ce message.');
  }

  return skip;
};