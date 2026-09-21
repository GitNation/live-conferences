const { getSite, enableBuilds, startBuild, getDeploy } = require('./api');
const { slackMessageOnBuild } = require('./slackMessageOnBuild');

exports.createBuild = async ({ userName, commandName }) => {
  const [site] = await Promise.all([getSite(), enableBuilds(true)]);
  const build = await startBuild();
  const deploy = await getDeploy(build.deploy_id);
  const message = slackMessageOnBuild({
    userName,
    siteUrl: site.ssl_url,
    screenshotUrl: site.screenshot_url || `${site.ssl_url}/img/favicon.png`,
    previewUrl: deploy.links.permalink,
    commandName,
    buildId: build.id,
    deployId: build.deploy_id,
    branch: site.repo_branch,
    repoUrl: site.repo_url,
    adminUrl: site.admin_url,
  });
  /**
   * Awaited so the PATCH actually lands — the Lambda freezes the moment the handler
   * returns, and an unfinished one leaves the site with auto-builds on. Failing it
   * must not cost the user the preview link, hence the catch.
   */
  await enableBuilds(false).catch(console.error);
  return message;
};
