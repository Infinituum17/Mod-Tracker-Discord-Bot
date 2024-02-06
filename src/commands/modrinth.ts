import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';

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

        if (!name) {
            logger.warn('`name` option not found in `modrinth`');

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xf83d58)
                        .setTitle('🔍 Mod Tracker')
                        .setDescription(`❌ Name option wasn't specified!`)
                        .setThumbnail('https://i.imgur.com/HguGI4C.png'),
                ],
            });
            return;
        }

        if (!projectId) {
            logger.warn('`project-id` option not found in `channel`');

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xf83d58)
                        .setTitle('🔍 Mod Tracker')
                        .setDescription(
                            `❌ Project-id option wasn't specified!`
                        )
                        .setThumbnail('https://i.imgur.com/HguGI4C.png'),
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
                    new EmbedBuilder()
                        .setColor(0xf83d58)
                        .setTitle('🔍 Mod Tracker')
                        .setDescription(
                            `❌ Can't select Modrinth project for mod '**${name}**' because the name hasn't been used yet!`
                        )
                        .setThumbnail('https://i.imgur.com/HguGI4C.png'),
                ],
            });

            return;
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xf83d58)
                    .setTitle('🔍 Mod Tracker')
                    .setDescription(
                        `🕹️ Setting Modrinth project '${projectId.toString()}' for mod '**${name}**'...`
                    )
                    .setThumbnail('https://i.imgur.com/HguGI4C.png'),
            ],
        });

        logger.log(
            `Set modrinth project for mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.setModrinthId(interaction.guildId!, name, projectId);
    },
};

export default modrinthCommand;
