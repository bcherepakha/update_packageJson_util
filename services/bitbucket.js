export class BitbucketApi {
  static getBitbucketRepoBaseUrl(owner, repoName) {
    return `https://api.bitbucket.org/2.0/repositories/${owner}/${repoName}`
  }

  static getAuthHeader(token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  static async getFileContent({token, baseURL, branchName, filePath}) {
    try {
        const response = await fetch(
          `${baseURL}/src/${branchName}/${filePath}`,
          {
            headers: {
              ...BitbucketApi.getAuthHeader(token),
              'Content-Type': 'application/json'
            },
          }
        );

        const data = await response.json();

        if (response.status !== 200) {
          throw new Error(`[Bitbucket API] ${data.error.message}`);
        }

        return data;
    } catch (error) {
        throw error;
    }
  }

  static async createCommitByUpdateTheFile({
    authorEmail,
    authorName,
    token,
    baseURL,
    branchName,
    parentBranchName,
    filePath,
    fileContent,
    message
  }) {
    const body = {
      author: `${authorName} <${authorEmail}>`,
      message,
      parents: parentBranchName,
      [filePath]: fileContent,
      branch: branchName,
    }

    const urlencodedBodyKeyValues = [];

    for (const property in body) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(body[property]);

      urlencodedBodyKeyValues.push(`${encodedKey}=${encodedValue}`);
    }

    const updateFileResponse = await fetch(
        `${baseURL}/src`,
        {
          method: 'POST',
          headers: {
            ...BitbucketApi.getAuthHeader(token),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: urlencodedBodyKeyValues.join('&')
        }
    );

    const data = await updateFileResponse.text();

    if (updateFileResponse.status !== 201) {
      throw new Error(`[Bitbucket API] ${JSON.parse(data).error.message}`);
    }

    return data;
  }

  static async createPullRequest({
      token,
      baseURL,
      sourceBranch = 'updatePackageJson',
      destinationBranch,
      description = 'This pull request updates package.json',
      title
  }) {
    const url = `${baseURL}/pullrequests`;
    const body = {
      title,
      description,
      source: {
        branch: {
          name: sourceBranch
        }
      },
      destination: {
        branch: {
          name: destinationBranch
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...BitbucketApi.getAuthHeader(token),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.status !== 201) {
      throw new Error(`[Bitbucket API] ${data.error.message}`);
    }

    return data;
  }

  constructor({
    token,
    owner,
    repoName,
    botEmail,
    destinationBranch = 'main'
  }) {
    this.token = token;
    this.owner = owner;
    this.repoName = repoName;
    this.botEmail = botEmail;
    this.destinationBranch = destinationBranch;
    this.baseURL = BitbucketApi.getBitbucketRepoBaseUrl(this.owner, this.repoName);
  }

  getFileContent(filePath, branchName = this.destinationBranch) {
    return BitbucketApi.getFileContent({
      token: this.token,
      baseURL: this.baseURL,
      branchName,
      filePath
    });
  }

  createCommitByUpdateTheFile(newBranchName, filePath, fileContent, message) {
    return BitbucketApi.createCommitByUpdateTheFile({
      authorEmail: this.botEmail,
      authorName: this.owner,
      token: this.token,
      baseURL: this.baseURL,
      branchName: newBranchName,
      filePath,
      fileContent,
      message,
      parentBranchName: this.destinationBranch
    });
  }

  createPullRequest(newBranchName, description, title) {
    return BitbucketApi.createPullRequest({
      token: this.token,
      baseURL: this.baseURL,
      sourceBranch: newBranchName,
      destinationBranch: this.destinationBranch,
      description,
      title
    });
  }
}
