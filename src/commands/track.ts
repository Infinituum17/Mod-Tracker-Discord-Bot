import {
    SlashCommandBuilder,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import type { Command } from '../types/Command';
import { storage, logger } from '../utils/global';
import { buildModTrackerEmbed } from '../utils/commandUtils';

const trackCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Starts mod-tracking')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('The name of the mod')
                .setRequired(true)
        ),
    async execute(interaction) {
        const name = interaction.options.getString('name');

        const embed = buildModTrackerEmbed();

        if (!name) {
            logger.warn('`name` option not found in `track`');

            await interaction.reply({
                embeds: [
                    embed.setDescription(`❌ Name option wasn't specified!`),
                ],
            });
            return;
        }

        if (!interaction.inGuild) {
            logger.warn("`track` command wasn't run in guild");
            return;
        }

        if (storage.isRegistered(interaction.guildId!, name)) {
            logger.warn(`\`${name}\` has already been found in storage`);

            await interaction.reply({
                embeds: [
                    embed.setDescription(
                        `❌ Can't track mod '**${name}**' because the name is already in use!`
                    ),
                ],
            });

            return;
        }

        await interaction.reply({
            embeds: [
                embed.setDescription(
                    `🕹️ Started tracking mod '**${name}**'...`
                ),
            ],
        });

        logger.log(
            `Started tracking mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.registerMod(interaction.guildId!, name);
    },
    async autocomplete(interaction) {
        return;
    },
};

export default trackCommand;
