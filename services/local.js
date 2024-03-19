// TODO maybe make sence to move it to params lately
const TEMP_DIR = './__temp__';

export function getTempRepositoryDir(repoName, tempDir = TEMP_DIR) {
    return `${tempDir}/${repoName}`;
}
