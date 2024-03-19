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
    logger = console.log,
}) {
    const baseURL = getBitbucketRepoBaseUrl(BITBUCKET_REPO_OWNER, BITBUCKET_REPO_NAME);
    const filePath = 'package.json';

    try {
        logger('1. get content of package.info');
        const packageJsonContent = await getPackageJsonContent({
            token: BITBUCKET_TOKEN,
            baseURL,
            branchName: BITBUCKET_REPO_DESTINATION_BRANCH_NAME,
            filePath
        })

        logger('2. change content of package.info');
        const newPackageJsonContent = udateDependency(packageJsonContent, NPM_PACKAGE_NAME, NPM_PACKAGE_VERSION);

        logger('3. Create a commit by uploading a new package.json to a new branch');
        const newBranchName = `update_${NPM_PACKAGE_NAME}_${NPM_PACKAGE_VERSION}`;

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

        logger('4. try to create pull request');
        const pullRequest = await createPullRequest({
            token: BITBUCKET_TOKEN,
            baseURL,
            sourceBranch: newBranchName,
            destinationBranch: BITBUCKET_REPO_DESTINATION_BRANCH_NAME,
            description: `This pull request updates dependency ${NPM_PACKAGE_NAME} in package.json to version ${NPM_PACKAGE_VERSION}`,
            title: `update version of ${NPM_PACKAGE_NAME} to ${NPM_PACKAGE_VERSION}`
        });

        logger(`Created on: ${pullRequest.links.html.href}`);
    } catch (err) {
        throw new Error(err.message);

        return ;
    }
}
