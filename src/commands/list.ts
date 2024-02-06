import { Guild, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';
import { buildModTrackerEmbed } from '../utils/commandUtils';

const listCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lists all tracked mods'),
    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.inGuild) {
            logger.warn("`list` command wasn't run in guild");
            return;
        }

        const embed = buildModTrackerEmbed();
        const trackedMods = storage.getAllTrackedMods(interaction.guildId!);

        const fields = await Promise.all(
            trackedMods.map(async (mod) => ({
                name: `🕹️ ${mod.name}`,
                value: `- Channel: ${await getChannel(
                    interaction.guild!,
                    mod.channel
                )}\n- Modrinth: \`${mod.modrinth ?? '❌'}\`\n- CurseForge: \`${
                    mod.curseforge ?? '❌'
                }\``,
            }))
        );

        await interaction.editReply({
            embeds: [
                trackedMods.length > 0
                    ? embed.addFields(fields)
                    : embed.setDescription('👀 No mods are currently tracked'),
            ],
        });
    },
};

async function getChannel(guild: Guild, channelId: string | null) {
    if (channelId === null) return '❌';

    return (await guild.channels.fetch(channelId))?.toString();
}

export default listCommand;
