import init from './utils/init';

import { cmdlist, defaultcmd } from './commands';

const WORKFLOW_DIR = 'workflow';

async function main(args: string[]) {
  const baseData = await init(WORKFLOW_DIR);
  let func = defaultcmd;
  for (let f of cmdlist) {
    if (f.command == args[0]) {
      func = f;
      break;
    }
  }
  func.eval(baseData, args.slice(1));
}

const args = process.argv.slice(2);
main(args);
