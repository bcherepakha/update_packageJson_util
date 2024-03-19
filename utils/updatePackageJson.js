import {
    getBitbucketRepoBaseUrl,
    getPackageJsonContent,
    createCommitByUpdateTheFile,
    createPullRequest
} from '../services/bitbucket.js';
import { udateDependency } from '../services/package.js';

export async function updatePackageJson({
    BITBUCKET_BOT_EMAIL,
    BITBUCKET_TOKEN,
    BITBUCKET_REPO_OWNER,
    BITBUCKET_REPO_NAME,
    BITBUCKET_REPO_DESTINATION_BRANCH_NAME = 'main',
    NPM_PACKAGE_NAME,
    NPM_PACKAGE_VERSION,
    JSON_STRINGIFY_SPACE = 2,
}) {
    const baseURL = getBitbucketRepoBaseUrl(BITBUCKET_REPO_OWNER, BITBUCKET_REPO_NAME);
    const filePath = 'package.json';

    // TODO: add normal loging
    console.log('1. get content of package.info');

    let packageJsonContent;

    try {
        packageJsonContent = await getPackageJsonContent({
            token: BITBUCKET_TOKEN,
            baseURL,
            branchName: BITBUCKET_REPO_DESTINATION_BRANCH_NAME,
            filePath
        });
    } catch (err) {
      // TODO: change error handling
      console.error('Error fetching package.json: ', err.message)

      return ;
    }

    console.log('2. change content of package.info');
    let newPackageJsonContent;

    try {
        newPackageJsonContent = udateDependency(packageJsonContent, NPM_PACKAGE_NAME, NPM_PACKAGE_VERSION);
    } catch (err) {
        // TODO: change error handling
        console.error('Error updating content package.json: ', err.message)

        return ;
    }

    console.log('3. Create a commit by uploading a new package.json to a new branch');
    const newBranchName = `update_${NPM_PACKAGE_NAME}_${NPM_PACKAGE_VERSION}`;

    try {
        await createCommitByUpdateTheFile({
            authorEmail: BITBUCKET_BOT_EMAIL,
            authorName: BITBUCKET_REPO_OWNER,
            token: BITBUCKET_TOKEN,
            baseURL,
            branchName: newBranchName,
            filePath,
            jsonContent: newPackageJsonContent,
            message: `update version of ${NPM_PACKAGE_NAME} to ${NPM_PACKAGE_VERSION}`,
            parentBranchName: BITBUCKET_REPO_DESTINATION_BRANCH_NAME,
            jsonStringifySpace: JSON_STRINGIFY_SPACE
        });
    } catch (err) {
        // TODO: change error handling
        console.error(err.message);

        return ;
    }

    console.log('4. try to create pull request');
    try {
        const pullRequest = await createPullRequest({
            token: BITBUCKET_TOKEN,
            baseURL,
            sourceBranch: newBranchName,
            destinationBranch: BITBUCKET_REPO_DESTINATION_BRANCH_NAME,
            description: `This pull request updates dependency ${NPM_PACKAGE_NAME} in package.json to version ${NPM_PACKAGE_VERSION}`,
            title: `update version of ${NPM_PACKAGE_NAME} to ${NPM_PACKAGE_VERSION}`
        });

        console.log(`Created on: ${pullRequest.links.html.href}`);
    } catch (err) {
        // TODO: change error handling
        console.error(err.message);

        return ;
    }
}
