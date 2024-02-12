import {
    SlashCommandBuilder,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import type { Command } from '../types/Command';
import { storage } from '../utils/global';
import {
    logFastReply,
    outsideGuild,
    verifyRequiredOptionString,
    warnFastReply,
} from '../utils/commandUtils';

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
    async execute(int) {
        if (outsideGuild(int)) return;

        const name = await verifyRequiredOptionString(int, 'name');

        if (!name) return;

        if (!storage.isRegistered(int.guildId!, name)) {
            return warnFastReply(
                int,
                `\`${name}\` hasn't been found in storage`,
                `❌ Can't delete mod '**${name}**' because the name hasn't been used yet!`
            );
        }

        await logFastReply(
            int,
            `Deleted mod \`${name}\` in guild \`${int.guildId}\`...`,
            `🕹️ Deleting mod '**${name}**'...`
        );

        storage.deleteMod(int.guildId!, name);
    },
    async autocomplete(interaction) {
        if (outsideGuild(interaction, true)) return;

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

export default deleteCommand;
