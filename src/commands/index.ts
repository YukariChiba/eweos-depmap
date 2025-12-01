import { Command } from 'commander';
import bygroup from './bygroup';
import bylist from './bylist';
import bypreset from './bypreset';
import listpresets from './listpresets';

const cmdlist: Command[] = [bygroup, bylist, bypreset, listpresets];

export default cmdlist;
