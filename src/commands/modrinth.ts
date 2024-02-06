import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import {
    buildModTrackerEmbed,
    buildModrinthAPIEmbed,
} from '../utils/commandUtils';
import { ModrinthAPI } from '../api/ModrinthAPI';

const modrinthCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('modrinth')
        .setDescription('Attaches a Modrinth project to a tracked mod')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('The name of the mod')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption((option) =>
            option
                .setName('project-id-or-slug')
                .setDescription('The project id/slug of the mod to track')
                .setRequired(true)
        ),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const projectId = interaction.options.getString('project-id-or-slug');

        const embed = buildModTrackerEmbed();

        if (!name) {
            logger.warn('`name` option not found in `modrinth`');

            await interaction.reply({
                embeds: [
                    embed.setDescription(`❌ Name option wasn't specified!`),
                ],
            });
            return;
        }

        if (!projectId) {
            logger.warn('`project-id` option not found in `channel`');

            await interaction.reply({
                embeds: [
                    embed.setDescription(
                        `❌ Project-id option wasn't specified!`
                    ),
                ],
            });
            return;
        }

        if (!interaction.inGuild) {
            logger.warn("`modrinth` command wasn't run in guild");
            return;
        }

        if (!storage.isRegistered(interaction.guildId!, name)) {
            logger.warn(`\`${name}\` hasn't been found in storage`);

            await interaction.reply({
                embeds: [
                    embed.setDescription(
                        `❌ Can't select Modrinth project for mod '**${name}**' because the name hasn't been used yet!`
                    ),
                ],
            });

            return;
        }

        const api = new ModrinthAPI();
        let verified = false;

        try {
            verified = await api.verify(projectId);
        } catch (error) {
            if ((error as Error).message === 'Rate limit exceeded') {
                await interaction.reply({
                    embeds: [
                        buildModrinthAPIEmbed().setDescription(
                            `❌ Could not verify mod, retry later`
                        ),
                    ],
                });
                return;
            }
        }

        if (!verified) {
            await interaction.reply({
                embeds: [
                    buildModrinthAPIEmbed().setDescription(
                        `❌ The specified id or slug doesn't exist!`
                    ),
                ],
            });
            return;
        }

        await interaction.reply({
            embeds: [
                embed.setDescription(
                    `🕹️ Setting Modrinth project '${projectId.toString()}' for mod '**${name}**'...`
                ),
            ],
        });

        logger.log(
            `Set modrinth project for mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.setModrinthId(interaction.guildId!, name, projectId);
    },
};

export default modrinthCommand;
