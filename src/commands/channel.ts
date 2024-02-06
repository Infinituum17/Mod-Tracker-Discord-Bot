import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import { buildCustomEmbed } from '../utils/commandUtils';

const curseforgeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Sets the channel where the bot writes messages')
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
                .setDescription('The channel where the bot will send messages')
                .setRequired(true)
        ),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const channel = interaction.options.getChannel('channel');

        const embed = buildCustomEmbed();

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

        await interaction.reply({
            embeds: [
                embed.setDescription(
                    `🕹️ Setting channel '${channel.toString()}' for mod '**${name}**'...`
                ),
            ],
        });

        logger.log(
            `Set channel for mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.setModChannel(interaction.guildId!, name, channel.id);
    },
};

export default curseforgeCommand;
