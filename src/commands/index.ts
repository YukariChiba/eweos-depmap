import { Command } from 'commander';
import bygroup from './bygroup';
import bylist from './bylist';
import bypreset from './bypreset';
import byall from './byall';
import listpresets from './listpresets';

const cmdlist: Command[] = [bygroup, bylist, bypreset, byall, listpresets];

export default cmdlist;
