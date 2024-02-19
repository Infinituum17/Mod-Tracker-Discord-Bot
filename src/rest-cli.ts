import type { REST } from 'discord.js';
import { serializeCommands } from './utils/commandUtils';
import { createREST } from './api/discord/create';
import { registerGuildCommands } from './api/discord/applicationGuildCommands/register';
import { registerGlobalCommands } from './api/discord/applicationCommands/register';
import { deleteGuildCommands } from './api/discord/applicationGuildCommands/delete';
import { deleteGlobalCommands } from './api/discord/applicationCommands/delete';

function init() {
    const TOKEN = process.env.TOKEN;

    if (!TOKEN) {
        console.log('TOKEN not specified in .env file');
        return;
    }

    const REST = createREST(TOKEN, '10');

    processArguments(REST, process.argv);
}

function processArguments(REST: REST, argv: string[]) {
    const CLIENT_ID = process.env.CLIENT_ID;

    if (!CLIENT_ID) {
        console.log('CLIENT_ID not specified in .env file');
        return;
    }

    const hlArgv = consume(argv, 2);
    let guild_id = null;

    if (hlArgv.length === 0 || hlArgv.includes('-h')) {
        printHelp();
        return;
    }

    const arg = hlArgv[0];
    consume(hlArgv);

    if (hlArgv.length > 0) {
        switch (hlArgv[0]) {
            case '-g':
                consume(hlArgv);

                guild_id = hlArgv[0];
                consume(hlArgv);

                break;
            default:
                printHelp();
                return;
        }
    }

    switch (arg) {
        case 'register':
            if (guild_id !== null) {
                registerGuildCommands(
                    REST,
                    CLIENT_ID,
                    guild_id,
                    serializeCommands()
                );
            } else {
                registerGlobalCommands(REST, CLIENT_ID, serializeCommands());
            }
            break;
        case 'delete':
            if (guild_id !== null) {
                deleteGuildCommands(REST, CLIENT_ID, guild_id);
            } else {
                deleteGlobalCommands(REST, CLIENT_ID);
            }
            break;
        default:
            printHelp();
            return;
    }
}

function consume(arr: string[], n = 1): string[] {
    while (n > 0) {
        arr.shift();
        n--;
    }

    return arr;
}

function printHelp() {
    console.log(
        '\nUsage:\n  register: Registers/refreshes commands using the REST api.\n  delete: Deletes all commands.\n\n  Options:\n    -g [GUILD_ID]: Specifies the guild on which to run the action.\n    -h: Prints help message.\n'
    );
}

init();
