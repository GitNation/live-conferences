const { getSite, enableBuilds, startBuild } = require('./api');
const { slackMessageOnBuild } = require('./slackMessageOnBuild');

exports.createBuild = async ({ userName, commandName }) => {
  const [site] = await Promise.all([getSite(), enableBuilds(true)]);
  const build = await startBuild();
  /**
   * Spelled out instead of read from getDeploy().links.permalink: Slack drops the
   * command after 3 seconds, and that lookup is a whole round-trip for one string.
   */
  const previewUrl = `https://${build.deploy_id}--${site.name}.netlify.app`;
  const message = slackMessageOnBuild({
    userName,
    siteUrl: site.ssl_url,
    screenshotUrl: site.screenshot_url || `${site.ssl_url}/img/favicon.png`,
    previewUrl,
    commandName,
    buildId: build.id,
    deployId: build.deploy_id,
    branch: site.repo_branch,
    repoUrl: site.repo_url,
    adminUrl: site.admin_url,
  });
  /**
   * Note: don't await for this
   */
  enableBuilds(false);
  return JSON.stringify(message);
};
