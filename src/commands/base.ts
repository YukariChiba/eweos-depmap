import { Command } from 'commander';

class GraphCommand extends Command {
  constructor(command: string) {
    super(command);
    this.option(
      '--no-ignorelist',
      'do not use ignorelist to resolve dependency loop',
    );
    this.option('--bootstrap', 'enable extra bootstrapping path (also sets --no-checkdepends)');
    this.option('--no-checkdepends', 'ignore checkdepends');
  }
}

export default GraphCommand;
