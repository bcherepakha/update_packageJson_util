#!/usr/bin/env node

import { program } from 'commander';
import { updatePackageJson } from './utils/updatePackageJson.js';

program
    .name('updatePackageJson')
    .description('Create PR on bitbucket with update package in package.json')
    // TODO: think to use version from package.json
    .version('0.2.0')
    .command('updatePackage')
    .option('-be --bot-email <botEmail>', 'bot email adress for commits')
    .option('-t --token <token>', 'bot token for authirization')
    .option('-w --workspace <workspace>', 'repository owner (workspace)')
    .option('-r --repository <repository>', 'repository name')
    .option('-b --branch <branch>', '<optional> branch when we get package.json and destination for PR')
    .option('-p --packageData <packageData>', 'name and version of package to change in format name@version')
    .action(async (options) => {
        const { botEmail, token, workspace, repository, branch = 'main', packageData } = options;
        const [packageName, packageVersion] = packageData.split('@');

        try {
            await updatePackageJson({
                BITBUCKET_BOT_EMAIL: botEmail,
                BITBUCKET_TOKEN: token,
                BITBUCKET_REPO_OWNER: workspace,
                BITBUCKET_REPO_NAME: repository,
                BITBUCKET_REPO_DESTINATION_BRANCH_NAME: branch,
                NPM_PACKAGE_NAME: packageName,
                NPM_PACKAGE_VERSION: packageVersion,
                // space for formating json file JSON.stringify(text, null, space)
                JSON_STRINGIFY_SPACE: 2,
                logger: (...args) => console.log('\x1b[32m%s\x1b[0m', ...args)
            });
        } catch(error) {
            console.log('\x1b[31m%s\x1b[0m', error.message);
            process.exit(1);
        }

        process.exit();
    })
    .parse(process.argv);
