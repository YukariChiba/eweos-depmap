interface BaseData {
  contentMap: Map<PackageName, any>;
  baseMap: Map<PackageBase, PackageName>;
  groupsMap: Map<PackageName, Set<GroupName>>;
  providesMap: Map<ProvideName, PackageName>;
}

interface BaseCommandEval {
  (baseData: BaseData, args: string[]): void;
}

interface BaseCommand {
  command: string;
  description?: string;
  eval: BaseCommandEval;
}

interface PackageName extends String {}
interface PackageBase extends String {}
interface GroupName extends String {}
interface ProvideName extends String {}

type IgnoreList = Record<string, string[]>;
interface PackagesPreset {
  description?: string;
  groups?: GroupName[];
  packages?: PackageName[];
}
type PackagesPresets = Record<string, PackagesPreset>;

type GraphConfig = {
  ignorelist: boolean;
  checkdepends: boolean;
  bootstrap: boolean;
};

type BootstrapConfig = {
  no_makedepends: string[];
  remove_depends: Record<string, string[]>;
};
