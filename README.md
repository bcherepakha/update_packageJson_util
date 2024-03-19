# script that updates package.json in BitBucket repo and opens a pull request

Small CLI tool to create PR on bitbucket with updated package in dependencies or devDependencies package.json.

## Usage

preferred **node v.17 and upper**
tested on **node v.20.8.1**

## Setup authentication

I am thinking of using .env to pass parameters,
and I may add standard parameters for the CLI afterward.

## How it works

1. Fetch the content of package.json from the repository. (by Clone repository using git in temp folder)
2. create new branch `update_NPM_PACKAGE_NAME_NPM_PACKAGE_VERSION` (or need todo fork think about access?)
3. Update the dependency to the specified version in package.json (is always package.json in root)
4. commit changes locally using git
5. Upload the updated package.json file back to the repository. (push the branch, using git)
6. Open a pull request from the creation branch to destination branch (using bitbucket api)

## To Do

* think about using with another services (expected then all except p6 may reused)
* think about store parameters (CLI)
* think about update .lock (can be using npm or yarn)
* replace console log by someone beautiful and more functional logger
* think to fetch only package.json without cloning all files from repository
* think about version (only existing)
* add typescript
* git maybe not installed
* think about add parameter for new branch name
