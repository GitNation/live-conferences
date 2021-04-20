const axios = require('axios');

const siteId = process.env.SITE_ID;
const token = process.env.NETLIFY_AUTH_TOKEN;

const client = axios.create({
  baseURL: `https://api.netlify.com/api/v1/sites/${siteId}`,
  timeout: 3000,
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
  return response.data;
};

exports.getAllDeploys = async () => {
  const response = await client.get('/deploys');
  if (response.statusText !== 'OK') {
    throw new Error("can't get site details");
  }
  return response.data;
};

exports.getDeploy = async (deployId) => {
  try {
    const response = await client.get(`/deploys/${deployId}`);
    if (response.statusText !== 'OK') {
      throw new Error("can't get site details");
    }
    return response.data;
  } catch (err) {
    if (err.isAxiosError) {
      if (err.response.status === 404) {
        throw new Error(`wrong Deploy ID: \`${deployId}\``);
      }
    }
    throw err;
  }
};

exports.rolloutDeploy = async (deployId) => {
  try {
    const response = await client.post(`/deploys/${deployId}/restore`);
    if (response.statusText !== 'OK') {
      throw new Error("can't get site details");
    }
    return response.data;
  } catch (err) {
    if (err.isAxiosError) {
      if (err.response.status === 404) {
        throw new Error(`wrong Deploy ID: \`${deployId}\``);
      }
    }
    throw err;
  }
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

exports.sendMessage = async (hook, message) => {
  console.log('🚀 ~ file: api.js ~ line 114 ~ exports.sendMessage= ~ message', message);
  await axios.post(hook, message, {
    headers: {
      'content-type': 'application/json',
    },
  });
};
