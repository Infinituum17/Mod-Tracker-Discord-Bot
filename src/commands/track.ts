import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { storage, logger } from '../utils/global';

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

        if (!name) {
            logger.warn('`name` option not found in `track`');

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

        if (!interaction.inGuild) {
            logger.warn("`track` command wasn't run in guild");
            return;
        }

        if (storage.isRegistered(interaction.guildId!, name)) {
            logger.warn(`\`${name}\` has already been found in storage`);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xf83d58)
                        .setTitle('🔍 Mod Tracker')
                        .setDescription(
                            `❌ Can't track mod '**${name}**' because the name is already in use!`
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
                    .setDescription(`🕹️ Started tracking mod '**${name}**'...`)
                    .setThumbnail('https://i.imgur.com/HguGI4C.png'),
            ],
        });

        logger.log(
            `Started tracking mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.registerMod(interaction.guildId!, name);
    },
};

export default trackCommand;
