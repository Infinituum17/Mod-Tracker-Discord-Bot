import {
    SlashCommandBuilder,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import {
    fastReply,
    logFastReply,
    outsideGuild,
    verifyRequiredOptionChannel,
    verifyRequiredOptionString,
    verifyRequiredSubcommand,
    warnFastReply,
} from '../utils/commandUtils';

const channelCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Sets the channel where the bot writes messages')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('modrinth')
                .setDescription('Sets a channel to receive Modrinth messages')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('The name of the mod')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel where the bot will send messages'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('curseforge')
                .setDescription('Sets a channel to receive CurseForge messages')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('The name of the mod')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel where the bot will send messages'
                        )
                        .setRequired(true)
                )
        ),
    async execute(int) {
        if (outsideGuild(int)) return;

        const name = await verifyRequiredOptionString(int, 'name');
        const channel = await verifyRequiredOptionChannel(int, 'channel');
        const subcommand = await verifyRequiredSubcommand(int);

        if (!name || !channel || !subcommand) return;

        if (!storage.isRegistered(int.guildId!, name)) {
            return warnFastReply(
                int,
                `\`${name}\` hasn't been found in storage`,
                `❌ Can't select channel for mod '**${name}**' because the name hasn't been used yet!`
            );
        }

        switch (subcommand) {
            case 'modrinth':
                storage.setModrinthChannel(int.guildId!, name, channel.id);

                await logFastReply(
                    int,
                    `Setting Modrinth channel for mod \`${name}\` in guild \`${int.guildId}\`...`,
                    `🕹️ Setting Modrinth channel '${channel.toString()}' for mod '**${name}**'...`
                );

                break;
            case 'curseforge':
                storage.setCurseForgeChannel(int.guildId!, name, channel.id);

                await logFastReply(
                    int,
                    `Setting CurseForge channel for mod \`${name}\` in guild \`${int.guildId}\`...`,
                    `🕹️ Setting CurseForge channel '${channel.toString()}' for mod '**${name}**'...`
                );

                break;
            default:
                return await fastReply(
                    int,
                    `❌ An invalid subcommand was provided!`
                );
        }
    },
    async autocomplete(int) {
        if (!int.inGuild) {
            return logger.warn(
                `Can't complete command \`${int.commandName}\` (not in a guild)`
            );
        }

        const focused = int.options.getFocused(true);
        let choices: ApplicationCommandOptionChoiceData<string | number>[] = [];

        if (focused.name === 'name') {
            choices = storage
                .getAllTrackedMods(int.guildId!)
                .filter((mod) => mod.display_name.startsWith(focused.value))
                .map((mod) => ({
                    name: mod.display_name,
                    value: mod.display_name,
                }));
        }

        await int.respond(choices);
    },
};

export default channelCommand;
