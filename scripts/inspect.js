const { request } = require('./graphql-client');

const inspect = async () => {
  const resp = await request(`#graphql
    query {
      pieceOfTexts {
        id

      }
    }
  `);

  console.log(resp);
};

inspect();
