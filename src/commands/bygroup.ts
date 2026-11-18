import DepGraph from '../utils/depgraph';
import init from '../utils/init';
import GraphCommand from './base';
import { BaseData, GraphConfig, GroupName, mkGroupName } from '../utils/types';

function anal(
  baseData: BaseData,
  searchGroup: GroupName,
  options: GraphConfig,
) {
  const fullDependencyGraph = DepGraph.fromGroup(baseData, options);

  if (!searchGroup || !fullDependencyGraph.has(searchGroup)) {
    console.log('Fail. Group not exists.');
    return;
  }
  const elems = fullDependencyGraph.get(searchGroup);

  if (!elems) {
    console.log('Fail. Graph generation failed.');
    return;
  }

  console.log(`Build Order for group ${searchGroup.data}: `);
  DepGraph.buildorder(elems);
}

const cmdfn = async (group?: string, options?: GraphConfig) => {
  const baseData: BaseData = await init();
  if (options == undefined) {
    console.log('Fail. Empty options.');
    return;
  }
  if (group) anal(baseData, mkGroupName(group), options);
  else
    for (const grp of baseData.groupsMap.keys()) anal(baseData, grp, options);
};

const cmd = new GraphCommand('bygroup')
  .description('generate build order for a pkg group')
  .argument('[group]', 'package group name, leave blank to check all groups')
  .action(cmdfn);

export default cmd;
