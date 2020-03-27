import { expect } from 'chai';

import * as userApi from './api';

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('retourne un utilisateur quand un utilisateur peut être trouvé', async () => {
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'baptiste',
            email: 'baptiste.gislot@gmail.com',
            role: 'ADMIN',
          },
        },
      };

      const result = await userApi.user({ id: '1' });

      expect(result.data).to.eql(expectedResult);
    });

    it('retourne null quand aucun utilisateur est trouvé', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      };

      const result = await userApi.user({ id: '42' });

      expect(result.data).to.eql(expectedResult);
    });
  });

  describe('deleteUser(id: String!): Boolean!', () => {
    it('retourne une error car seulement les admins peuvent supprimer un utilisateur', async () => {
      const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await userApi.signIn({
        login: 'baptiste',
        password: 'tototata',
      });

      const {
        data: { errors },
      } = await userApi.deleteUser({ id: '1' }, token);

      expect(errors[0].message).to.eql('Vous n\'êtes pas admin.');
    });
  });
});