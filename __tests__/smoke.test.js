import regeneratorRuntime from 'regenerator-runtime';
// import { getContent } from '@focus-reactive/graphql-content-layer';
var { getContent } = require('../content');

describe('Content layer', () => {
  it('should render content', async () => {
    const result = await getContent();
  });
});
