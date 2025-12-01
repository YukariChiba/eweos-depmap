import fs from 'fs/promises';
import path from 'path';
import { normalizeDepName } from './pkginfo';

async function init(
  workflow_dir: string = 'workflow',
  repos = ['main', 'testing'],
): Promise<BaseData> {
  let allFiles = [];
  for (const subdir of repos) {
    const dir = `${workflow_dir}/${subdir}`;
    try {
      const filesInDir = await fs.readdir(dir);
      const filteredFiles = filesInDir
        .filter(
          (file) =>
            file.endsWith('.json') &&
            !file.startsWith('_') &&
            !file.endsWith('.files.json'),
        )
        .map((file) => path.join(dir, file));
      allFiles.push(...filteredFiles);
    } catch (error) {
      throw error;
    }
  }
  const allPackages = await Promise.all(
    allFiles.map(async (file) => {
      const content = await fs.readFile(file, 'utf8');
      return JSON.parse(content);
    }),
  );
  const contentMap = new Map(allPackages.map((pkg) => [pkg.NAME, pkg]));
  const baseMap = new Map(allPackages.map((pkg) => [pkg.NAME, pkg.BASE]));
  const groupsMap = new Map();
  const providesMap = new Map(allPackages.map((pkg) => [pkg.NAME, pkg.NAME]));

  for (const pkg of allPackages) {
    if (pkg.GROUPS) {
      for (const groupName of pkg.GROUPS) {
        if (!groupsMap.has(groupName)) {
          groupsMap.set(groupName, new Set());
        }
        groupsMap.get(groupName).add(pkg.NAME);
      }
    }
    if (pkg.PROVIDES) {
      for (const provideName of pkg.PROVIDES)
        providesMap.set(normalizeDepName(provideName), pkg.NAME);
    }
  }
  return {
    contentMap,
    baseMap,
    groupsMap,
    providesMap,
  };
}

export default init;
