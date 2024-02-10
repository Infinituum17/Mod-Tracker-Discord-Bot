import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import { buildModTrackerEmbed } from '../utils/commandUtils';

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
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const channel = interaction.options.getChannel('channel');

        const embed = buildModTrackerEmbed();

        if (!name) {
            logger.warn('`name` option not found in `channel`');

            await interaction.reply({
                embeds: [
                    embed.setDescription(`❌ Name option wasn't specified!`),
                ],
            });
            return;
        }

        if (!channel) {
            logger.warn('`channel` option not found in `channel`');

            await interaction.reply({
                embeds: [
                    embed.setDescription(`❌ Channel option wasn't specified!`),
                ],
            });
            return;
        }

        if (!interaction.inGuild) {
            logger.warn("`channel` command wasn't run in guild");
            return;
        }

        if (!storage.isRegistered(interaction.guildId!, name)) {
            logger.warn(`\`${name}\` hasn't been found in storage`);

            await interaction.reply({
                embeds: [
                    embed.setDescription(
                        `❌ Can't select channel for mod '**${name}**' because the name hasn't been used yet!`
                    ),
                ],
            });

            return;
        }

        let subcommand;

        try {
            subcommand = interaction.options.getSubcommand(true);
        } catch (error) {
            await interaction.reply({
                embeds: [
                    embed.setDescription(`❌ No subcommand was provided!`),
                ],
            });

            return;
        }

        switch (subcommand) {
            case 'modrinth':
                storage.setModrinthChannel(
                    interaction.guildId!,
                    name,
                    channel.id
                );

                await interaction.reply({
                    embeds: [
                        embed.setDescription(
                            `🕹️ Setting Modrinth channel '${channel.toString()}' for mod '**${name}**'...`
                        ),
                    ],
                });

                logger.log(
                    `Setting Modrinth channel for mod \`${name}\` in guild \`${interaction.guildId}\`...`
                );
                break;
            case 'curseforge':
                storage.setCurseForgeChannel(
                    interaction.guildId!,
                    name,
                    channel.id
                );

                await interaction.reply({
                    embeds: [
                        embed.setDescription(
                            `🕹️ Setting CurseForge channel '${channel.toString()}' for mod '**${name}**'...`
                        ),
                    ],
                });

                logger.log(
                    `Setting CurseForge channel for mod \`${name}\` in guild \`${interaction.guildId}\`...`
                );
                break;
            default:
                await interaction.reply({
                    embeds: [
                        embed.setDescription(
                            `❌ An invalid subcommand was provided!`
                        ),
                    ],
                });

                return;
        }
    },
};

export default channelCommand;
