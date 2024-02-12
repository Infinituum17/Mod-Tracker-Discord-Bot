import {
    SlashCommandBuilder,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import type { Command } from '../types/Command';
import { storage } from '../utils/global';
import {
    buildModrinthAPIEmbed,
    fastReply,
    logFastReply,
    outsideGuild,
    verifyRequiredOptionString,
    warnFastReply,
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
    async execute(int) {
        if (outsideGuild(int)) return;

        const name = await verifyRequiredOptionString(int, 'name');
        const projectId = await verifyRequiredOptionString(
            int,
            'project-id-or-slug'
        );

        if (!name || !projectId) return;

        if (!storage.isRegistered(int.guildId!, name)) {
            return await warnFastReply(
                int,
                `\`${name}\` hasn't been found in storage`,
                `❌ Can't select Modrinth project for mod '**${name}**' because the name hasn't been used yet!`
            );
        }

        const api = new ModrinthAPI();
        let verified = false;

        try {
            verified = await api.verify(projectId);
        } catch (error) {
            if ((error as Error).message === 'Rate limit exceeded') {
                return await fastReply(
                    int,
                    `❌ Could not verify mod, retry later`,
                    buildModrinthAPIEmbed
                );
            }
        }

        if (!verified) {
            return await fastReply(
                int,
                `❌ The specified id or slug doesn't exist!`
            );
        }

        await logFastReply(
            int,
            `Set modrinth project for mod \`${name}\` in guild \`${int.guildId}\`...`,
            `🕹️ Setting Modrinth project '${projectId.toString()}' for mod '**${name}**'...`
        );

        storage.setModrinthId(int.guildId!, name, projectId);
    },
    async autocomplete(interaction) {
        if (outsideGuild(interaction, true)) return;

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

export default modrinthCommand;
