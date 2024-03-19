import { BitbucketApi } from '../services/bitbucket.js';
import { udateDependency } from '../services/package.js';
import { ProgressStepLogger, ProcessStdoutLogger } from './progressStepLogger.js';

export async function updatePackageJson({
  botEmail,
  token,
  owner,
  repoName,
  destinationBranch,
  dependencyName,
  dependencyVersion,
  jsonStringifySpace = 2,
  logger = new ProgressStepLogger(new ProcessStdoutLogger()),
}) {
  const gitApi = new BitbucketApi({
    token,
    owner,
    repoName,
    botEmail,
    destinationBranch
  });
  const filePath = 'package.json';

  try {
    logger.startTask('Get content of package.info');
    const packageJsonContent = await gitApi.getFileContent(filePath);

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.startTask('Change content of package.info');
    const newPackageJsonContent = udateDependency(packageJsonContent, dependencyName, dependencyVersion);

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.startTask('Create a commit by uploading a new package.json to a new branch');
    const newBranchName = `update_${dependencyName}_${dependencyVersion}`;

    await gitApi.createCommitByUpdateTheFile(
      newBranchName,
      filePath,
      JSON.stringify(newPackageJsonContent, null, jsonStringifySpace),
      `update version of ${dependencyName} to ${dependencyVersion}`
    );

    logger.complete(ProgressStepLogger.STATUS.SUCCESS);

    logger.startTask('Create pull request');
    const pullRequest = await gitApi.createPullRequest(
      newBranchName,
      `This pull request updates dependency ${dependencyName} in package.json to version ${dependencyVersion}`,
      `update version of ${dependencyName} to ${dependencyVersion}`
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
