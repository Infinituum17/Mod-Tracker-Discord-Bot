import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import { buildModTrackerEmbed } from '../utils/commandUtils';

const deleteCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a tracked mod')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('The name of the mod')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(interaction) {
        const name = interaction.options.getString('name');

        const embed = buildModTrackerEmbed();

        if (!name) {
            logger.warn('`name` option not found in `delete`');

            await interaction.reply({
                embeds: [
                    embed.setDescription(`❌ Name option wasn't specified!`),
                ],
            });
            return;
        }

        if (!interaction.inGuild) {
            logger.warn("`delete` command wasn't run in guild");
            return;
        }

        if (!storage.isRegistered(interaction.guildId!, name)) {
            logger.warn(`\`${name}\` hasn't been found in storage`);

            await interaction.reply({
                embeds: [
                    embed.setDescription(
                        `❌ Can't delete mod '**${name}**' because the name hasn't been used yet!`
                    ),
                ],
            });

            return;
        }

        await interaction.reply({
            embeds: [embed.setDescription(`🕹️ Deleting mod '**${name}**'...`)],
        });

        logger.log(
            `Deleted mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.deleteMod(interaction.guildId!, name);
    },
};

export default deleteCommand;
