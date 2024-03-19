export function getBitbucketRepoBaseUrl(owner, repoName) {
  return `https://api.bitbucket.org/2.0/repositories/${owner}/${repoName}`
}

export async function getPackageJsonContent({token, baseURL, branchName, filePath}) {
  try {
      const response = await fetch(
        `${baseURL}/src/${branchName}/${filePath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

export async function createCommitByUpdateTheFile({
  authorEmail,
  authorName,
  token,
  baseURL,
  branchName,
  parentBranchName,
  filePath,
  jsonContent,
  message,
  jsonStringifySpace
}) {
  const body = {
    author: `${authorName} <${authorEmail}>`,
    message,
    parents: parentBranchName,
    [filePath]: JSON.stringify(jsonContent, null, jsonStringifySpace),
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
          Authorization: `Bearer ${token}`,
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

export async function createPullRequest({
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
        Authorization: `Bearer ${token}`,
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
