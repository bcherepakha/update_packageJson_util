export function udateDependency(packageJsonContent, dependencyName, newVersion) {
  const packageJsonContentClone = structuredClone(packageJsonContent);

  if (packageJsonContentClone.dependencies && packageJsonContentClone.dependencies[dependencyName]) {
    packageJsonContentClone.dependencies[dependencyName] = newVersion;

    return packageJsonContentClone;
  }

  if (packageJsonContentClone.devDependencies && packageJsonContentClone.devDependencies[dependencyName]) {
    packageJsonContentClone.devDependencies[dependencyName] = newVersion;

    return packageJsonContentClone;
  }

  throw new Error(`[Package API] Dependency ${dependencyName} not found in package.json.`);
}
