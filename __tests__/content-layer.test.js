import regeneratorRuntime from "regenerator-runtime";
// import { getContent } from '@focus-reactive/graphql-content-layer';
var { getContent } = require('../content');

describe('Content layer', () => {
  it('should matchSnapshot', async () => {
    const content = await getContent();

    expect(content).toMatchSnapshot();
  });
});
