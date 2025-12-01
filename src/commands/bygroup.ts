import DepGraph from '../utils/depgraph';
import init from '../utils/init';
import GraphCommand from './base';

function anal(baseData: BaseData, searchGroup?: GroupName, options?: GraphConfig) {
  let elems = [];
  const fullDependencyGraph = DepGraph.fromGroup(baseData, options);
  if (!fullDependencyGraph.has(searchGroup)) {
    console.log('Fail. Group not exists.');
    return;
  }
  elems = fullDependencyGraph.get(searchGroup);

  console.log(`Build Order for group ${searchGroup}: `);
  DepGraph.buildorder(elems);
}

const cmdfn = async (group?: string, options?: GraphConfig) => {
  const baseData: BaseData = await init();
  if (group) anal(baseData, group, options);
  else for (const grp of baseData.groupsMap.keys()) anal(baseData, grp, options);
};

const cmd = new GraphCommand('bygroup')
  .description('generate build order for a pkg group')
  .argument('[group]', 'package group name, leave blank to check all groups')
  .action(cmdfn);

export default cmd;
