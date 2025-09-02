import bygroup from './bygroup';
import bylist from './bylist';
import help from './help';

const cmdlist: BaseCommand[] = [bygroup, bylist, help];
const defaultcmd = help;

export { cmdlist, defaultcmd };
