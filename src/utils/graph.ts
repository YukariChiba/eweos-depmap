import { normalizeDepName } from './pkginfo';
import cytoscape from 'cytoscape';

function genDependencyGraphByList(
  baseData: BaseData,
  packageList: Set<string>,
  loose = false,
) {
  const dependencyGraph = [];
  for (const pkgName of packageList) {
    dependencyGraph.push({ data: { id: baseData.baseMap.get(pkgName) } });
    const pkgdata = baseData.contentMap.get(pkgName);
    const fullDeps = []
      .concat(pkgdata.DEPENDS || [])
      .concat(loose ? [] : pkgdata.CHECKDEPENDS || [])
      .concat(pkgdata.MAKEDEPENDS || []);
    for (const dep of fullDeps) {
      const depName = baseData.providesMap.get(normalizeDepName(dep));
      if (!depName) continue;
      if (packageList.has(depName)) {
        const source = baseData.baseMap.get(depName);
        const target = baseData.baseMap.get(pkgName);
        if (source != target)
          dependencyGraph.push({
            data: {
              id: `${depName}_${pkgName}`,
              source: baseData.baseMap.get(depName),
              target: baseData.baseMap.get(pkgName),
            },
          });
      }
    }
  }
  return dependencyGraph;
}

function genDependencyGraphByGroup(baseData: BaseData, loose = false) {
  const fullDependencyGraph = new Map();
  for (const group of baseData.groupsMap.keys()) {
    const dependencyGraph = genDependencyGraphByList(
      baseData,
      baseData.groupsMap.get(group) || new Set([]),
      loose,
    );
    fullDependencyGraph.set(group, dependencyGraph);
  }
  return fullDependencyGraph;
}

function calcBuildOrder(elems: any[]) {
  const cy = cytoscape({
    headless: true,
    elements: elems,
  });

  let step = 1;
  let headlist = null;
  while (1) {
    headlist = cy.nodes('[[indegree = 0]]');
    if (headlist.length == 0) {
      const remainlist = cy.nodes();
      if (remainlist.length == 0) console.log('Success.');
      else {
        console.log('Fail. Remaining packages:');
        console.log(remainlist.map((i) => i.id()));
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

export { genDependencyGraphByGroup, genDependencyGraphByList, calcBuildOrder };
