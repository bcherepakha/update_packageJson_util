# script that updates package.json in BitBucket repo and opens a pull request

Small tool to create PR on bitbucket with updated package in dependencies or devDependencies package.json.

## Usage

preferred **node v.17 and upper**
tested on **node v.20.8.1**

The utility is located at ./utils/updatePackageJson.js and import function that can be called to perform the task. This utility do not needed any dependency.

```js
import { updatePackageJson } from './utils/updatePackageJson.js';

updatePackageJson({
    // bot email adress for commits
    BITBUCKET_BOT_EMAIL: 'some@bots.bitbucket.org',
    // bot token for authirization
    BITBUCKET_TOKEN: 'some token',
    // repository owner (workspace)
    BITBUCKET_REPO_OWNER: 'bcherepakha',
    // repository name
    BITBUCKET_REPO_NAME: 'test_update_package_util',
    // branch when we get package.json and destination for PR
    BITBUCKET_REPO_DESTINATION_BRANCH_NAME: 'main',
    // name and version of the package what we want to change in dependencies
    NPM_PACKAGE_NAME: 'react',
    NPM_PACKAGE_VERSION: '0.0.12',
    // space for formating json file JSON.stringify(text, null, space)
    JSON_STRINGIFY_SPACE: 2
}).catch(err => console.log(err.message));
```

Also. You can use it like CLI utils with parameters if install dependencies:

for installing dependencies you can use:

```sh
node updateBitbucketPackage.js -be someEmail@bots.bitbucket.org -t some_token -w workspace -r repositoryName -b destinationBranch -p packageName@packageVersion
```

## Setup authentication

I am thinking of using .env to pass parameters,
and I may add standard parameters for the CLI afterward.

## How it works

1. Fetch content of package.info
2. Change content of package.info
3. Create a commit by uploading a new package.json to a new branch
4. Create pull request

all errors and steps logs to console

## TODO

* use logger for logs and errors
* use typescript if have time
* Think about preserving the original formatting of the file.
