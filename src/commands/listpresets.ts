import { Command } from 'commander';
import presetsobj from '../data/presets.json';

const cmdfn = async () => {
  const presets: PackagesPresets = presetsobj;
  console.log(`available presets:`);
  for (const preset of Object.keys(presets)) {
    console.log(
      ` ${preset}: ${presets[preset].description || 'No description'}`,
    );
  }
};

const cmd = new Command('listpresets')
  .description('list available presets')
  .action(cmdfn);

export default cmd;
