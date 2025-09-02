import { calcBuildOrder, genDependencyGraphByGroup } from '../utils/graph';

function anal(baseData: BaseData, searchGroup: string) {
  let elems = [];
  const fullDependencyGraph = genDependencyGraphByGroup(baseData);
  if (!fullDependencyGraph.has(searchGroup)) {
    console.log('Fail. Group not exists.');
    return;
  }
  elems = fullDependencyGraph.get(searchGroup);

  console.log(`Build Order for group ${searchGroup}: `);
  calcBuildOrder(elems);
}

const cmd: BaseCommand = {
  command: 'bygroup',
  description: "Generate build order for a pkg group",
  eval: (baseData: BaseData, args: string[]) => {
    if (args.length == 0) {
      for (const grp of baseData.groupsMap.keys()) anal(baseData, grp);
    } else {
      anal(baseData, args[0]);
    }
  },
};

export default cmd;
