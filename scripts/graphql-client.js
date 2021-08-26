const fetch = require('node-fetch');

const endpoint = process.env.CMS_ENDPOINT;
const token = process.env.AUTH_TOKEN;

function request(query, variables) {
  return fetch(endpoint, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
    .then((r) => r.json())
    .catch((err) => console.error(err));
}

module.exports = {
  request,
};
