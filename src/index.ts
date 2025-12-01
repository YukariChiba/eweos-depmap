import { Command } from 'commander';
import cmdlist from './commands';

const program = new Command();

program.version('1.0.0').description('eweOS dependency mapping program');

async function main() {
  for (const cmd of cmdlist) program.addCommand(cmd);

  program.parse(process.argv);
}

main();
