import type { Command } from '../types/Command';
import { SlashCommandBuilder } from 'discord.js';
import { storage } from '../utils/global';
import {
    logFastReply,
    outsideGuild,
    verifyRequiredOptionString,
    warnFastReply,
} from '../utils/commandUtils';

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
    async execute(int) {
        if (outsideGuild(int)) return;

        const name = await verifyRequiredOptionString(int, 'name');

        if (!name) return;

        if (storage.isRegistered(int.guildId!, name)) {
            return await warnFastReply(
                int,
                `\`${name}\` has already been found in storage`,
                `❌ Can't track mod '**${name}**' because the name is already in use!`
            );
        }

        await logFastReply(
            int,
            `Started tracking mod \`${name}\` in guild \`${int.guildId}\`...`,
            `🕹️ Started tracking mod '**${name}**'...`
        );

        storage.registerMod(int.guildId!, name);
    },
    async autocomplete(int) {
        return;
    },
};

export default trackCommand;
