## Netlify settings for productions sites:

should be specified in the netlify UI settings **not** in `netlify.toml`


1. `Deploys` > `Stop auto publishing`
2. `Build & deploy` > `Continuous Deployment` > `Build settings` > `Build command`: yarn build:<conf-code>
3. `Build & deploy` > `Continuous Deployment` > `Build settings` > `Publish directory`: build:<conf-code>
4. `Build & deploy` > `Continuous Deployment` > `Build settings` > `Builds`: Stop builds
5. `Functions` > `Deploy Settings` > `Functions directory`: ci/functions
6. `Sensitive variable policy` > `Deploy without sensitive variables`
7. Add env variables:
   1. CMS_ENDPOINT
   2. CMS_TOKEN
   3. NETLIFY_AUTH_TOKEN
   4. SLACK_SECRET

