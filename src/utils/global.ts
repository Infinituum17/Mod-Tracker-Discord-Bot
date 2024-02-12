import { Logger } from './logger';
import { readCommands } from './commandUtils';
import { Storage } from '../classes/Storage';

export const commands = await readCommands(true);
export const storage = new Storage();
export const logger = new Logger('MOD-TRACKER');
