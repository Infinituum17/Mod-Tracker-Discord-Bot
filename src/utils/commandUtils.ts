import type {
    CacheType,
    ChatInputCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder,
} from 'discord.js';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Command } from '../types/Command';
import { logger } from './global';
import { commands } from './global';

export async function readCommands(
    silent = false
): Promise<Map<string, Command>> {
    if (!silent)
        logger.log('Gathering commands from local `./commands` directory...');

    const localPath = 'commands';
    const fullPath = './src/' + localPath;
    const commandMap = new Map<string, Command>();
    const commands: Command[] = [];

    for (const fileName of await readdir(fullPath)) {
        commands.push(
            (await import('../' + join(localPath, fileName))).default
        );
    }

    for (const command of commands) {
        const commandName = (command.data as SlashCommandBuilder).name;
        if (!commandMap.has(commandName)) {
            if (!silent) logger.log(`Reading command \`${commandName}\`...`);
            commandMap.set(commandName, command);
        } else {
            throw new Error(
                `Duplicate entry: Command named ${commandName} was already present in the global command list`
            );
        }
    }

    if (!silent)
        logger.log(
            'Successfully gathered all commands from local `./commands` directory'
        );

    return commandMap;
}

export function serializeCommands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return Array.from(commands.values()).map((cmd) =>
        (cmd.data as SlashCommandBuilder).toJSON()
    );
}

export function logCommand(
    interaction: ChatInputCommandInteraction<CacheType>
) {
    logger.log(
        `Command \`${interaction.commandName}\` was called in guild ${
            interaction.guild!.name
        }`
    );
}
