import { ApolloServerPlugin } from '@apollo/server';

export const always200Plugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        // Override the HTTP status code to 200 if possible
        if (response.http) {
          response.http.status = 200;
        }
      },
    };
  },
};
