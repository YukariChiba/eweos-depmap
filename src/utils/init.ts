import fs from 'fs/promises';
import path from 'path';
import { normalizeDepName } from './pkginfo';
import {
  BaseData,
  mkPkgName,
  mkPkgBase,
  mkGroupName,
  mkProvideName,
  GroupName,
  PackageName,
} from './types';

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
  const contentMap = new Map(
    allPackages.map((pkg) => [mkPkgName(pkg.NAME), pkg])
  );
  const baseMap = new Map(
    allPackages.map((pkg) => [mkPkgName(pkg.NAME), mkPkgBase(pkg.BASE)])
  );
  const groupsMap = new Map<GroupName, Set<PackageName>>();
  const providesMap = new Map(
    allPackages.map((pkg) => [mkProvideName(pkg.NAME), mkPkgName(pkg.NAME)])
  );

  for (const pkg of allPackages) {
    if (pkg.GROUPS) {
      for (const gName of pkg.GROUPS) {
        const gObj = mkGroupName(gName);
        if (!groupsMap.has(gObj)) {
          groupsMap.set(gObj, new Set());
        }
        groupsMap.get(gObj)!.add(mkPkgName(pkg.NAME));
      }
    }
    if (pkg.PROVIDES) {
      for (const pName of pkg.PROVIDES) {
        const provideObj = mkProvideName(normalizeDepName(pName));
        providesMap.set(provideObj, mkPkgName(pkg.NAME));
      }
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
