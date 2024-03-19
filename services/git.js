import fs from 'fs';
import { simpleGit } from 'simple-git';

async function clone(remoteUrl, tempRepoDir, branch) {
  console.log('Clone repo process');

  console.log('Check is clone directory already exist... ');
  if (fs.existsSync(tempRepoDir)) {
    console.log('Yes. Then remove directory');
    fs.rmSync(repoDir, { recursive: true, force: true });
  }

  // needs difference git instance. then not needed to strore in var
  console.log('clone repository');
  await simpleGit().clone(remoteUrl, tempRepoDir);
  console.log('checkout branch');
  await simpleGit(tempRepoDir).checkoutLocalBranch(branch);
}

async function commit(tempRepoDir, message, updateFilesLocation) {
  console.log('Commit changes');
  await simpleGit(tempRepoDir).add(updateFilesLocation);
  await simpleGit(tempRepoDir).commit(message);
}

async function push(tempRepoDir, branchName) {
  console.log(`Push changes to branch ${branchName}`);
  await simpleGit(tempRepoDir).push('origin', branchName);
}

export { clone, commit, push };
