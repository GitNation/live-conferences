const axios = require('axios');

const siteId = process.env.SITE_ID;
const token = process.env.NETLIFY_AUTH_TOKEN;

const client = axios.create({
  baseURL: `https://api.netlify.com/api/v1/sites/${siteId}`,
  timeout: 1000,
  headers: {
    'content-type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

exports.getSite = async () => {
  const response = await client.get();
  if (response.statusText !== 'OK') {
    throw new Error("can't get site details");
  }
  // console.log('exports.getSite -> response.data', response.data);
  const {
    admin_url,
    build_settings: { dir, repo_branch, repo_url, stop_builds },
    custom_domain,
    name,
    screenshot_url,
    ssl_url,
  } = response.data;
  return {
    admin_url,
    dir,
    repo_branch,
    repo_url,
    stop_builds,
    custom_domain,
    name,
    screenshot_url,
    ssl_url,
  };
};

exports.enableBuilds = async (enable) => {
  const response = await client.patch('', {
    build_settings: { stop_builds: !enable },
  });
  if (response.statusText !== 'OK') {
    throw new Error("can't change build settings");
  }
  return response.data.build_settings;
};

exports.startBuild = async () => {
  const response = await client.post('/builds');
  if (response.statusText !== 'OK') {
    throw new Error("can't change build settings");
  }
  console.log('exports.startBuild -> response.data', response.data);
  return response.data;
};

exports.enableDeploys = async (enable) => {
  const clientDeploys = axios.create({
    baseURL: 'https://api.netlify.com/api/v1/deploys',
    timeout: 1000,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
