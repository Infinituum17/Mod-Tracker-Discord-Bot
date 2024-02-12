import {
    SlashCommandBuilder,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import {
    buildCurseForgeAPIEmbed,
    fastReply,
    logFastReply,
    outsideGuild,
    verifyRequiredOptionString,
    warnFastReply,
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
    async execute(int) {
        if (outsideGuild(int)) return;

        const name = await verifyRequiredOptionString(int, 'name');
        const projectId = await verifyRequiredOptionString(int, 'project-id');

        if (!name || !projectId) return;

        if (!storage.isRegistered(int.guildId!, name)) {
            return await warnFastReply(
                int,
                `\`${name}\` hasn't been found in storage`,
                `❌ Can't select CurseForge project for mod '**${name}**' because the name hasn't been used yet!`
            );
        }

        const api = new CurseForgeAPI();

        if (!(await api.verify(projectId))) {
            return await fastReply(
                int,
                `❌ The specified id doesn't exist!`,
                buildCurseForgeAPIEmbed
            );
        }

        await logFastReply(
            int,
            `Set curseforge project for mod \`${name}\` in guild \`${int.guildId}\`...`,
            `🕹️ Setting CurseForge project '${projectId.toString()}' for mod '**${name}**'...`
        );

        storage.setCurseForgeId(int.guildId!, name, projectId);
    },
    async autocomplete(interaction) {
        if (!interaction.inGuild) {
            return logger.warn(
                `Can't complete command \`${interaction.commandName}\` (not in a guild)`
            );
        }

        const focused = interaction.options.getFocused(true);
        let choices: ApplicationCommandOptionChoiceData<string | number>[] = [];

        if (focused.name === 'name') {
            choices = storage
                .getAllTrackedMods(interaction.guildId!)
                .filter((mod) => mod.display_name.startsWith(focused.value))
                .map((mod) => ({
                    name: mod.display_name,
                    value: mod.display_name,
                }));
        }

        await interaction.respond(choices);
    },
};

export default curseforgeCommand;
