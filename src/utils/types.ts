interface BaseData {
  contentMap: Map<string, any>;
  baseMap: Map<string, string>;
  groupsMap: Map<string, Set<string>>;
  providesMap: Map<string, string>;
}

interface BaseCommandEval {
  (baseData: BaseData, args: string[]): void;
}

interface BaseCommand {
  command: string;
  description?: string;
  eval: BaseCommandEval;
}
