import DepGraph from '../utils/depgraph';
import init from '../utils/init';
import GraphCommand from './base';
import presetsobj from '../data/presets.json';
import {
  BaseData,
  GraphConfig,
  mkGroupName,
  mkPkgName,
  PackageName,
  PackagesPresets,
} from '../utils/types';

const cmdfn = async (preset: string, options: GraphConfig) => {
  const presets: PackagesPresets = presetsobj;
  const targetPreset = presets[preset];

  if (!targetPreset) {
    console.error(`Error: Preset '${preset}' not found.`);
    return;
  }

  const baseData: BaseData = await init();
  const finalPackageList = new Set<PackageName>(); // Set of strings

  if (targetPreset.packages) {
    targetPreset.packages.forEach((p) => finalPackageList.add(mkPkgName(p)));
  }
  if (targetPreset.groups) {
    for (const grp of targetPreset.groups) {
      const groupPkgs = baseData.groupsMap.get(mkGroupName(grp));
      if (groupPkgs) {
        groupPkgs.forEach((p) => finalPackageList.add(p));
      }
    }
  }
  const graph = new DepGraph(baseData, finalPackageList, options);

  console.log(`Build Order for preset '${preset}': `);
  DepGraph.buildorder(graph.dependencyGraph);
};

const cmd = new GraphCommand('bypreset')
  .description('generate build order for a preset of packages')
  .argument('<preset>', 'package preset name')
  .action(cmdfn);

export default cmd;
