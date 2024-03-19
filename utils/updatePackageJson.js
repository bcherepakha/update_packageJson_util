import { BitbucketApi } from '../services/bitbucket.js';
import { udateDependency } from '../services/package.js';
import { ProgressStepLogger, ProcessStdoutLogger } from './progressStepLogger.js';

export async function updatePackageJson({
  BITBUCKET_BOT_EMAIL,
  BITBUCKET_TOKEN,
  BITBUCKET_REPO_OWNER,
  BITBUCKET_REPO_NAME,
  BITBUCKET_REPO_DESTINATION_BRANCH_NAME,
  NPM_PACKAGE_NAME,
  NPM_PACKAGE_VERSION,
  JSON_STRINGIFY_SPACE = 2,
  logger = new ProgressStepLogger(new ProcessStdoutLogger()),
}) {
  const gitApi = new BitbucketApi({
    token: BITBUCKET_TOKEN,
    owner: BITBUCKET_REPO_OWNER,
    repoName: BITBUCKET_REPO_NAME,
    botEmail: BITBUCKET_BOT_EMAIL,
    destinationBranch: BITBUCKET_REPO_DESTINATION_BRANCH_NAME
  });
  const filePath = 'package.json';

  try {
    logger.startTask('Get content of package.info');
    const packageJsonContent = await gitApi.getFileContent(filePath);

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.startTask('Change content of package.info');
    const newPackageJsonContent = udateDependency(packageJsonContent, NPM_PACKAGE_NAME, NPM_PACKAGE_VERSION);

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.startTask('Create a commit by uploading a new package.json to a new branch');
    const newBranchName = `update_${NPM_PACKAGE_NAME}_${NPM_PACKAGE_VERSION}`;

    await gitApi.createCommitByUpdateTheFile(
      newBranchName,
      filePath,
      JSON.stringify(newPackageJsonContent, null, JSON_STRINGIFY_SPACE),
      `update version of ${NPM_PACKAGE_NAME} to ${NPM_PACKAGE_VERSION}`
    );

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.startTask('Create pull request');
    const pullRequest = await gitApi.createPullRequest(
      newBranchName,
      `This pull request updates dependency ${NPM_PACKAGE_NAME} in package.json to version ${NPM_PACKAGE_VERSION}`,
      `update version of ${NPM_PACKAGE_NAME} to ${NPM_PACKAGE_VERSION}`
    );

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.addLog(`Created on: ${pullRequest.links.html.href}`, ProgressStepLogger.STATUS.SUCCESS);
    logger.end();
  } catch (err) {
    logger.complete(ProgressStepLogger.STATUS.ERROR);
    logger.setErrorMessage(err.message);
    logger.end();

    throw new Error(err.message);
  }
}
