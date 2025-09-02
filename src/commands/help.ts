import { cmdlist } from './index';

const cmd: BaseCommand = {
  command: 'help',
  description: 'Show help messages',
  eval: (baseData: BaseData, args: string[]) => {
    for (const cmd of cmdlist) {
      console.log(`  ${cmd.command} - ${cmd.description || 'Unknown command'}`);
    }
  },
};

export default cmd;
