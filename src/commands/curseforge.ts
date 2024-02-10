import {
    SlashCommandBuilder,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import {
    buildCurseForgeAPIEmbed,
    buildModTrackerEmbed,
} from '../utils/commandUtils';
import { CurseForgeAPI } from '../api/CurseForgeAPI';

const curseforgeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('curseforge')
        .setDescription('Attaches a Curseforge project to a tracked mod')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('The name of the mod')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption((option) =>
            option
                .setName('project-id')
                .setDescription('The project id of the mod to track')
                .setRequired(true)
        ),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const projectId = interaction.options.getString('project-id');

        const embed = buildModTrackerEmbed();

        if (!name) {
            logger.warn('`name` option not found in `curseforge`');

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
            logger.warn("`curseforge` command wasn't run in guild");
            return;
        }

        if (!storage.isRegistered(interaction.guildId!, name)) {
            logger.warn(`\`${name}\` hasn't been found in storage`);

            await interaction.reply({
                embeds: [
                    embed.setDescription(
                        `❌ Can't select CurseForge project for mod '**${name}**' because the name hasn't been used yet!`
                    ),
                ],
            });

            return;
        }

        const api = new CurseForgeAPI();

        if (!(await api.verify(projectId))) {
            await interaction.reply({
                embeds: [
                    buildCurseForgeAPIEmbed().setDescription(
                        `❌ The specified id doesn't exist!`
                    ),
                ],
            });
            return;
        }

        await interaction.reply({
            embeds: [
                embed.setDescription(
                    `🕹️ Setting CurseForge project '${projectId.toString()}' for mod '**${name}**'...`
                ),
            ],
        });

        logger.log(
            `Set curseforge project for mod \`${name}\` in guild \`${interaction.guildId}\`...`
        );

        storage.setCurseForgeId(interaction.guildId!, name, projectId);
    },
    async autocomplete(interaction) {
        if (!interaction.inGuild) {
            logger.warn(
                `Can't complete command \`${interaction.commandName}\` (not in a guild)`
            );
            return;
        }

        const focused = interaction.options.getFocused(true);
        let choices: ApplicationCommandOptionChoiceData<string | number>[] = [];

        if (focused.name === 'name') {
            choices = storage
                .getAllTrackedMods(interaction.guildId!)
                .filter((mod) => mod.name.startsWith(focused.value))
                .map((mod) => ({
                    name: mod.name,
                    value: mod.name,
                }));
        }

        await interaction.respond(choices);
    },
};

export default curseforgeCommand;
