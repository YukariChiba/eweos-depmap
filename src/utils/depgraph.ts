import { normalizeDepName } from './pkginfo';
import ignorelistobj from '../data/ignorelist.json';
import bootstrapobj from '../data/bootstrap.json';
import cytoscape, { ElementDefinition } from 'cytoscape';
import {
  BaseData,
  BootstrapConfig,
  GraphConfig,
  IgnoreList,
  PackageName,
  mkPkgName,
  mkGroupName,
  GroupName,
  mkProvideName,
} from './types';

const bootstraplist: BootstrapConfig = bootstrapobj;
const ignorelist: IgnoreList = ignorelistobj;

const PREFIX_BOOTSTRAP = 'bootstrap:';
const PREFIX_STAGING = 'staging:';
const GROUP_BASE = mkGroupName('base');
const GROUP_BASE_DEVEL = mkGroupName('base-devel');

function isBootstrapPkg(pkgName: PackageName) {
  if (bootstraplist.no_makedepends.includes(pkgName.data)) return true;
  if (Object.keys(bootstraplist.remove_depends).includes(pkgName.data))
    return true;
  return false;
}

class DepGraph {
  dependencyGraph: ElementDefinition[] = [];
  options: GraphConfig;
  baseData: BaseData;
  packageList: Set<PackageName>; // 存储 .data 字符串以确保唯一性
  excludedPackages: Set<PackageName>;

  constructor(
    baseData: BaseData,
    packageList: Set<PackageName>,
    options: GraphConfig = {
      ignorelist: true,
      checkdepends: true,
      bootstrap: false,
      base: false,
      baseDevel: false,
    },
  ) {
    this.baseData = baseData;
    this.packageList = packageList;
    this.options = options;
    this.excludedPackages = new Set<PackageName>();

    this.initializeExclusions();
    this.buildGraph();
  }

  private initializeExclusions() {
    const seedPackages: PackageName[] = []; // strings

    if (!this.options.baseDevel) {
      const basePkgs = this.baseData.groupsMap.get(GROUP_BASE);
      const develPkgs = this.baseData.groupsMap.get(GROUP_BASE_DEVEL);
      if (basePkgs) seedPackages.push(...basePkgs);
      if (develPkgs) seedPackages.push(...develPkgs);
    } else if (!this.options.base) {
      const basePkgs = this.baseData.groupsMap.get(GROUP_BASE);
      if (basePkgs) seedPackages.push(...basePkgs);
    }

    if (seedPackages.length === 0) return;

    const queue = [...seedPackages];

    while (queue.length > 0) {
      const currentPkgObj = queue.shift();
      if (!currentPkgObj) continue;

      if (this.excludedPackages.has(currentPkgObj)) continue;

      this.excludedPackages.add(currentPkgObj);

      const deps = this.getDepends(currentPkgObj);

      for (const depStr of deps) {
        const normalizedDep = mkProvideName(normalizeDepName(depStr));
        const resolvedPkg = this.baseData.providesMap.get(normalizedDep);

        if (resolvedPkg && !this.excludedPackages.has(resolvedPkg)) {
          queue.push(resolvedPkg);
        }
      }
    }
  }

  private getDepends(pkgName: PackageName, full: boolean = false): string[] {
    let ret: string[] = [];
    const pkgdata = this.baseData.contentMap.get(pkgName);
    if (!pkgdata) return [];

    ret = ret.concat(pkgdata.DEPENDS || []);

    const shouldCheck = this.options.checkdepends && !this.options.bootstrap;
    if (full || shouldCheck) {
      ret = ret.concat(pkgdata.CHECKDEPENDS || []);
    }

    const isBootstrap =
      this.options.bootstrap &&
      bootstraplist.no_makedepends.includes(pkgName.data);
    if (full || !isBootstrap) {
      ret = ret.concat(pkgdata.MAKEDEPENDS || []);
    }

    return ret;
  }

  private addNode(pkgName: PackageName) {
    const pkgBase = this.baseData.baseMap.get(pkgName);
    if (!pkgBase) return;

    if (this.options.bootstrap && isBootstrapPkg(pkgName)) {
      this.dependencyGraph.push({
        data: { id: `${PREFIX_BOOTSTRAP}${pkgBase.data}` },
      });
      this.dependencyGraph.push({
        data: { id: `${PREFIX_STAGING}${pkgBase.data}` },
      });
      this.baseData.baseMap.set(pkgName, {
        ...pkgBase,
        data: `${PREFIX_BOOTSTRAP}${pkgBase.data}`,
      });
    } else {
      this.dependencyGraph.push({
        data: { id: pkgBase.data },
      });
    }
  }

  private addEdge(
    pkgName: PackageName,
    depName: PackageName,
    overrideTargetId?: string,
  ) {
    if (this.options.ignorelist) {
      const ignores = ignorelist[pkgName.data];
      if (ignores && ignores.includes(depName.data)) return;
    }

    const sourceBase = this.baseData.baseMap.get(depName);
    const targetBase = this.baseData.baseMap.get(pkgName);

    const sourceId = sourceBase?.data;
    const targetId = overrideTargetId || targetBase?.data;

    if (!targetId || !sourceId) return;

    if (sourceId === targetId) return;

    this.dependencyGraph.push({
      data: {
        id: `${depName.data}_${pkgName.data}`,
        source: sourceId,
        target: targetId,
      },
    });
  }

  private buildGraph() {
    for (const pkgObj of this.packageList) {
      this.addNode(pkgObj);
    }

    for (const pkgObj of this.packageList) {
      this.processDependencies(pkgObj);

      if (this.options.bootstrap && isBootstrapPkg(pkgObj)) {
        this.processBootstrapDependencies(pkgObj);
      }
    }
  }

  private processDependencies(pkgName: PackageName) {
    const deps = this.getDepends(pkgName);
    for (const dep of deps) {
      const normalized = mkProvideName(normalizeDepName(dep));
      const resolvedPkg = this.baseData.providesMap.get(normalized);

      if (!resolvedPkg) continue;

      if (this.excludedPackages.has(resolvedPkg)) continue;

      if (this.packageList.has(resolvedPkg)) {
        this.addEdge(pkgName, resolvedPkg);
      }
    }
  }

  private processBootstrapDependencies(pkgName: PackageName) {
    const deps = this.getDepends(pkgName, true); // full depends
    for (const dep of deps) {
      const normalized = mkProvideName(normalizeDepName(dep));
      const resolvedPkg = this.baseData.providesMap.get(normalized);

      if (!resolvedPkg) continue;
      if (this.excludedPackages.has(resolvedPkg)) continue;

      const pkgBase = this.baseData.baseMap.get(pkgName);
      if (!pkgBase) continue;

      if (this.packageList.has(resolvedPkg)) {
        this.addEdge(
          pkgName,
          resolvedPkg,
          pkgBase.data.replace(PREFIX_BOOTSTRAP, PREFIX_STAGING),
        );
      }
    }
  }

  // Static Utility
  static fromGroup(baseData: BaseData, options: GraphConfig) {
    const fullDependencyGraph = new Map<GroupName, ElementDefinition[]>();
    for (const groupObj of baseData.groupsMap.keys()) {
      const groupPkgs =
        baseData.groupsMap.get(groupObj) || new Set<PackageName>();
      // groupPkgs is Set<string>
      const depGraphInst = new DepGraph(baseData, groupPkgs, options);
      fullDependencyGraph.set(groupObj, depGraphInst.dependencyGraph);
    }
    return fullDependencyGraph;
  }

  static buildorder(elements: ElementDefinition[]) {
    const cy = cytoscape({
      headless: true,
      styleEnabled: false,
      elements: elements,
    });

    let step = 1;
    while (true) {
      const headlist = cy.nodes('[[indegree = 0]]');

      if (headlist.length === 0 && cy.nodes().length === 0) {
        console.log('\nSuccess: All packages ordered.');
        break;
      }

      if (headlist.length === 0) {
        console.log('\nError: Circular dependency detected!');

        const sccs = cy.elements().tscc();
        const components = sccs.components;

        let cycleFound = false;
        let cycleIndex = 1;

        components.forEach((component) => {
          if (
            component.length > 1 ||
            component.edgesWith(component).length > 0
          ) {
            cycleFound = true;
            console.log(`\n[Cycle ${cycleIndex++}] Packages involved:`);
            console.log(
              component
                .nodes()
                .map((n) => n.id())
                .join(', '),
            );
          }
        });

        if (!cycleFound) {
          console.log('\nComplex deadlock detected. Remaining packages:');
          console.log(
            cy
              .nodes()
              .map((n) => n.id())
              .join(', '),
          );
        } else {
          console.log(`\nTotal ${cycleIndex - 1} cycle(s) found.`);
          console.log(
            `(Total ${cy.nodes().length} packages remain unordered due to cycles)`,
          );
        }

        break;
      }

      console.log(`- [ ] Step ${step++}:`);
      console.log('```');
      console.log(headlist.map((i) => i.id()).join(' '));
      console.log('```');
      cy.remove(headlist);
    }
  }
}

export default DepGraph;
