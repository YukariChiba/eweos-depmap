import DepGraph from '../utils/depgraph';
import init from '../utils/init';
import GraphCommand from './base';

const cmdfn = async (pkgs: string[], options?: GraphConfig) => {
  const baseData: BaseData = await init();
  const graph = new DepGraph(baseData, new Set(pkgs), options);
  console.log(`Build Order for packages: `);
  DepGraph.buildorder(graph.dependencyGraph);
};

const cmd = new GraphCommand('bylist')
  .description('generate build order for a list of packages')
  .argument('<pkgs...>')
  .action(cmdfn);

export default cmd;
