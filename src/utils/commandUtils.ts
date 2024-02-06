import {
    EmbedBuilder,
    type CacheType,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
    type SlashCommandBuilder,
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

export function buildModTrackerEmbed() {
    return new EmbedBuilder()
        .setColor(0xf83d58)
        .setTitle('🔍 Mod Tracker')
        .setThumbnail('https://i.imgur.com/HguGI4C.png');
}

export function buildModrinthAPIEmbed() {
    return new EmbedBuilder()
        .setColor(0x35da72)
        .setTitle('🟩 Modrinth API')
        .setThumbnail(
            'https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/a49f8e1b-3835-4ea1-a85b-118c6425ebc3/Modrinth_Dark_Logo.png'
        );
}

export function buildCurseForgeAPIEmbed() {
    return new EmbedBuilder()
        .setColor(0xfb7753)
        .setTitle('🛠️ CurseForge API')
        .setThumbnail(
            'https://cdn.apexminecrafthosting.com/img/uploads/2021/05/21163117/curseforge-logo.png'
        );
}
