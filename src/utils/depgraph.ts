import { normalizeDepName } from './pkginfo';
import ignorelistobj from '../data/ignorelist.json';
import bootstrapobj from '../data/bootstrap.json';
import cytoscape, { ElementDefinition } from 'cytoscape';

const bootstraplist: BootstrapConfig = bootstrapobj;
const ignorelist: IgnoreList = ignorelistobj;

const PREFIX_BOOTSTRAP = 'bootstrap:';
const PREFIX_STAGING = 'staging:';

function inBootstrap(pkgName: PackageName) {
  if (bootstraplist.no_makedepends.includes(pkgName.toString())) return true;
  if (Object.keys(bootstraplist.remove_depends).includes(pkgName.toString()))
    return true;
  return false;
}

class DepGraph {
  dependencyGraph: ElementDefinition[];
  options?: GraphConfig;
  baseData: BaseData;
  packageList: Set<PackageName>;

  getDepends(pkgName: PackageName, full: boolean = false) {
    let ret: string[] = [];
    const pkgdata = this.baseData.contentMap.get(pkgName);
    ret = ret.concat(pkgdata.DEPENDS || []);
    if (full || (this.options?.checkdepends && !this.options?.bootstrap))
      ret = ret.concat(pkgdata.CHECKDEPENDS || []);
    if (
      full ||
      !(
        this.options?.bootstrap &&
        bootstraplist.no_makedepends.includes(pkgName.toString())
      )
    )
      ret = ret.concat(pkgdata.MAKEDEPENDS || []);
    return ret;
  }

  addNode(pkgName: PackageName) {
    const pkgBase = this.baseData.baseMap.get(pkgName);
    if (!pkgBase) return;
    // handling bootstrap
    if (this.options?.bootstrap && inBootstrap(pkgName)) {
      this.dependencyGraph.push({
        data: { id: `${PREFIX_BOOTSTRAP}${pkgBase}` },
      });
      this.dependencyGraph.push({
        data: { id: `${PREFIX_STAGING}${pkgBase}` },
      });
      this.baseData.baseMap.set(pkgName, `${PREFIX_BOOTSTRAP}${pkgBase}`);
    } else {
      this.dependencyGraph.push({
        data: { id: pkgBase.toString() },
      });
    }
  }

  addEdge(
    pkgName: PackageName,
    depName: PackageName,
    overrideName?: PackageBase,
  ) {
    const sourceId = this.baseData.baseMap.get(depName);
    const targetId = overrideName || this.baseData.baseMap.get(pkgName);
    if (!targetId || !sourceId) return;
    if (this.packageList.has(depName)) {
      if (this.options?.ignorelist)
        if (Object.keys(ignorelist).includes(pkgName.toString()))
          if (ignorelist[pkgName.toString()].includes(depName.toString()))
            return;
      if (sourceId != targetId)
        this.dependencyGraph.push({
          data: {
            id: `${depName}_${pkgName}`,
            source: sourceId,
            target: targetId,
          },
        });
    }
  }

  static buildorder(input_elem?: any) {
    const elem = input_elem;
    const cy = cytoscape({
      headless: true,
      styleEnabled: false,
      elements: elem,
    });

    let step = 1;
    let headlist = null;
    while (1) {
      headlist = cy.nodes('[[indegree = 0]]');
      if (headlist.length === 0) {
        const remainlist = cy.nodes();
        if (remainlist.length === 0) {
          console.log('\nSuccess: All packages ordered.');
        } else {
          console.log(
            '\nError: Circular dependency or remaining packages detected:',
          );
          for (const i of remainlist.toArray()) {
            console.log({
              pkg: i.id(),
              deps: i.incomers('node').map((j) => j.id()),
            });
          }
          console.log(`(${remainlist.length} packages remaining)`);
        }
        break;
      }
      console.log(`- [ ] Step ${step++}:`);
      console.log('```');
      console.log(headlist.map((i) => i.id()));
      console.log('```');
      cy.remove('[[indegree = 0]]');
    }
  }

  constructor(
    baseData: BaseData,
    packageList: Set<PackageName>,
    options?: GraphConfig,
  ) {
    this.dependencyGraph = [];
    this.baseData = baseData;
    this.options = options;
    this.packageList = packageList;
    for (const pkgName of packageList) {
      this.addNode(pkgName);
    }
    for (const pkgName of packageList) {
      const deps = this.getDepends(pkgName);
      for (const dep of deps) {
        const depName = this.baseData.providesMap.get(normalizeDepName(dep));
        if (!depName) continue;
        this.addEdge(pkgName, depName);
      }
    }
    // handling bootstrap
    for (const pkgName of packageList) {
      if (this.options?.bootstrap && inBootstrap(pkgName)) {
        const deps = this.getDepends(pkgName, true);
        for (const dep of deps) {
          const depName = this.baseData.providesMap.get(normalizeDepName(dep));
          if (!depName) continue;
          const pkgBase = baseData.baseMap.get(pkgName);
          if (!pkgBase) continue;
          this.addEdge(
            pkgName,
            depName,
            pkgBase.replace(PREFIX_BOOTSTRAP, PREFIX_STAGING),
          );
        }
      }
    }
  }

  static fromGroup(baseData: BaseData, options?: GraphConfig) {
    const fullDependencyGraph = new Map();
    for (const group of baseData.groupsMap.keys()) {
      const depGraphInst = new DepGraph(
        baseData,
        baseData.groupsMap.get(group) || new Set([]),
        options,
      );
      fullDependencyGraph.set(group, depGraphInst.dependencyGraph);
    }
    return fullDependencyGraph;
  }
}

export default DepGraph;
