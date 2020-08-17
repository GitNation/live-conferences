const { getDeploy, rolloutDeploy } = require('./api');
const {
  slackMessageOnSuccessDeploy,
  slackMessageOnProgressDeploy,
  slackMessageOnCompletedDeploy,
} = require('./slackMessageOnDeploy');

exports.deployBuild = async ({ userName, commandName, deployId }) => {
  const deploy = await getDeploy(deployId);

  if (deploy.state !== 'ready') {
    if (deploy.state === 'building') {
      const message = slackMessageOnProgressDeploy({
        previewUrl: deploy.deploy_ssl_url,
        deployId,
        commandName,
      });
      return JSON.stringify(message);
    }
    throw new Error(`Deploy with id ${deployId} has status '${deploy.state}'`);
  }

  if (deploy.published_at) {
    const message = slackMessageOnCompletedDeploy({ deployId });
    return JSON.stringify(message);
  }

  const rollout = await rolloutDeploy(deployId);

  if (rollout.state !== 'ready') {
    throw new Error(
      `attempt to roll out version with Deploy ID ${deployId} got a status ${rollout.state}. Probably it was deployed anyway. Check ${rollout.ssl_url}`
    );
  }

  const message = slackMessageOnSuccessDeploy({
    deployId,
    siteUrl: deploy.ssl_url,
  });
  return JSON.stringify(message);
};
