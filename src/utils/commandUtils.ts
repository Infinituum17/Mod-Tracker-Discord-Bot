import {
    EmbedBuilder,
    type CacheType,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
    type SlashCommandBuilder,
    AutocompleteInteraction,
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

export function buildModTrackerEmbed() {
    return new EmbedBuilder()
        .setColor(0xf83d58)
        .setTitle('🔍 Mod Tracker')
        .setThumbnail('https://i.imgur.com/HguGI4C.png');
}

export function buildModrinthAPIEmbed() {
    return new EmbedBuilder()
        .setColor(0x35da72)
        .setTitle('🔧 Modrinth API')
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

export async function fastReply(
    int: ChatInputCommandInteraction<CacheType>,
    description: string,
    embedConstructor = buildModTrackerEmbed
) {
    await int.reply({
        embeds: [embedConstructor().setDescription(description)],
    });
}

export async function logFastReply(
    int: ChatInputCommandInteraction<CacheType>,
    logMessage: string,
    replyMessage: string,
    embedConstructor = buildModTrackerEmbed
) {
    logger.log(logMessage);
    await fastReply(int, replyMessage, embedConstructor);
}

export async function warnFastReply(
    int: ChatInputCommandInteraction<CacheType>,
    warnMessage: string,
    replyMessage: string,
    embedConstructor = buildModTrackerEmbed
) {
    logger.warn(warnMessage);
    await fastReply(int, replyMessage, embedConstructor);
}

async function isValidOption(
    int: ChatInputCommandInteraction<CacheType>,
    optName: string,
    optValue: any | null
): Promise<boolean> {
    if (!optValue) {
        await warnFastReply(
            int,
            `\`${optName}\` not found in command \`${int.commandName}\``,
            `❌ \`${optName}\` option is required and wasn't specified!`
        );

        return false;
    }

    return true;
}

export async function verifyRequiredSubcommand(
    int: ChatInputCommandInteraction<CacheType>
) {
    try {
        return int.options.getSubcommand(true);
    } catch (error) {
        await fastReply(int, `❌ No subcommand was provided!`);
        return null;
    }
}

export async function verifyRequiredOptionChannel(
    int: ChatInputCommandInteraction<CacheType>,
    optName: string
) {
    const optValue = int.options.getChannel(optName);

    if (!(await isValidOption(int, optName, optValue))) return null;

    return optValue;
}

export async function verifyRequiredOptionString(
    int: ChatInputCommandInteraction<CacheType>,
    optName: string
): Promise<string | null> {
    const optValue = int.options.getString(optName);

    if (!(await isValidOption(int, optName, optValue))) return null;

    return optValue;
}

export function outsideGuild(
    int:
        | ChatInputCommandInteraction<CacheType>
        | AutocompleteInteraction<CacheType>,
    autocompleted = false
) {
    if (!int.inGuild()) {
        if (!autocompleted)
            logger.warn(
                `Command \`${int.commandName}\` was ran outside of guild`
            );
        else
            logger.warn(
                `Command \`${int.commandName}\` is trying to be autocompleted outside of guild`
            );
        return true;
    }

    return false;
}
