import 'regenerator-runtime';
import { getContent } from '@focus-reactive/graphql-content-layer';

const conferenceSettings = require('../src/conferences/jsn/conference-settings');

describe('Content layer', () => {
  it('should matchSnapshot', async () => {
    const content = await getContent(conferenceSettings);

    expect(content).toMatchSnapshot();
  });
});
