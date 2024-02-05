import { REST } from 'discord.js';

export function createREST(token: string, version: string) {
    return new REST({ version }).setToken(token);
}
