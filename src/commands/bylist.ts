import { calcBuildOrder, genDependencyGraphByList } from '../utils/graph';

function anal(baseData: BaseData, packageList: Set<string>) {
  let elems = [];
  elems = genDependencyGraphByList(baseData, packageList);

  console.log(`Build Order for packages: `);
  calcBuildOrder(elems);
}

const cmd: BaseCommand = {
  command: 'bylist',
  description: 'Generate build order for a list of packages',
  eval: (baseData: BaseData, args: string[]) => {
    anal(baseData, new Set(args));
  },
};

export default cmd;
