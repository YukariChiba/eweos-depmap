import DepGraph from '../utils/depgraph';
import init from '../utils/init';
import GraphCommand from './base';
import presetsobj from '../data/presets.json';

const cmdfn = async (preset: string, options: GraphConfig) => {
  const presets: PackagesPresets = presetsobj;
  const targetPreset = presets[preset];

  if (!targetPreset) {
    console.error(`Error: Preset '${preset}' not found.`);
    return;
  }

  const baseData: BaseData = await init();
  const finalPackageList = new Set<string>();

  if (targetPreset.packages) {
    targetPreset.packages.forEach((p) => finalPackageList.add(p.toString()));
  }
  if (targetPreset.groups) {
    for (const grp of targetPreset.groups) {
      const groupPkgs = baseData.groupsMap.get(grp);
      if (groupPkgs) {
        groupPkgs.forEach((p) => finalPackageList.add(p.toString()));
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
