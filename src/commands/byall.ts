import { BaseData, GraphConfig } from 'utils/types';
import DepGraph from '../utils/depgraph';
import init from '../utils/init';
import GraphCommand from './base';

const cmdfn = async (options?: GraphConfig) => {
  const baseData: BaseData = await init();
  const pkgs = baseData.contentMap.keys();
  const graph = new DepGraph(baseData, new Set(pkgs), options);
  console.log(`Build Order for packages: `);
  DepGraph.buildorder(graph.dependencyGraph);
};

const cmd = new GraphCommand('byall')
  .description('generate build order for all packages')
  .action(cmdfn);

export default cmd;
