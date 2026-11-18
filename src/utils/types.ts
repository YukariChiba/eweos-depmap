export enum DataType {
  PackageName = 'PackageName',
  PackageBase = 'PackageBase',
  GroupName = 'GroupName',
  ProvideName = 'ProvideName',
}

export interface TypedData {
  type: DataType;
  data: string;
}

export interface PackageName extends TypedData {
  type: DataType.PackageName;
}
export interface PackageBase extends TypedData {
  type: DataType.PackageBase;
}
export interface GroupName extends TypedData {
  type: DataType.GroupName;
}
export interface ProvideName extends TypedData {
  type: DataType.ProvideName;
}

const internCache = new Map<string, TypedData>();

function getInterned<T extends TypedData>(type: DataType, data: string): T {
  const key = `${type}:${data}`;

  if (!internCache.has(key)) {
    internCache.set(key, { type, data });
  }

  return internCache.get(key) as T;
}

export const mkPkgName = (data: string): PackageName =>
  getInterned<PackageName>(DataType.PackageName, data);

export const mkPkgBase = (data: string): PackageBase =>
  getInterned<PackageBase>(DataType.PackageBase, data);

export const mkGroupName = (data: string): GroupName =>
  getInterned<GroupName>(DataType.GroupName, data);

export const mkProvideName = (data: string): ProvideName =>
  getInterned<ProvideName>(DataType.ProvideName, data);

export interface BaseData {
  contentMap: Map<PackageName, any>;
  baseMap: Map<PackageName, PackageBase>;
  groupsMap: Map<GroupName, Set<PackageName>>;
  providesMap: Map<ProvideName, PackageName>;
}

export interface BaseCommandEval {
  (baseData: BaseData, args: string[]): void;
}

export interface BaseCommand {
  command: string;
  description?: string;
  eval: BaseCommandEval;
}

export type IgnoreList = Record<string, string[]>;

export interface PackagesPreset {
  description?: string;
  groups?: string[];
  packages?: string[];
}
export type PackagesPresets = Record<string, PackagesPreset>;

export type GraphConfig = {
  ignorelist: boolean;
  checkdepends: boolean;
  bootstrap: boolean;
  baseDevel: boolean;
  base: boolean;
};

export type BootstrapConfig = {
  no_makedepends: string[];
  remove_depends: Record<string, string[]>;
};
