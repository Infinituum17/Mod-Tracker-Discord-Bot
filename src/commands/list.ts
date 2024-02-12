import type { Command } from '../types/Command';
import { Guild, SlashCommandBuilder } from 'discord.js';
import { storage } from '../utils/global';
import { buildModTrackerEmbed, outsideGuild } from '../utils/commandUtils';

const listCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lists all tracked mods'),
    async execute(int) {
        if (outsideGuild(int)) return;

        await int.deferReply();

        const embed = buildModTrackerEmbed();
        const trackedMods = storage.getAllTrackedMods(int.guildId!);

        const fields = await Promise.all(
            trackedMods.map(async (mod) => ({
                name: `🕹️ ${mod.display_name}`,
                value: `- Modrinth Channel: ${await getChannel(
                    int.guild!,
                    mod.modrinth_channel
                )}\n- CurseForge Channel: ${await getChannel(
                    int.guild!,
                    mod.curseforge_channel
                )}\n- Modrinth: \`${
                    mod.modrinth_id ?? '❌'
                }\`\n- CurseForge: \`${mod.curseforge_id ?? '❌'}\``,
            }))
        );

        await int.editReply({
            embeds: [
                trackedMods.length > 0
                    ? embed.addFields(fields)
                    : embed.setDescription('👀 No mods are currently tracked'),
            ],
        });
    },
    async autocomplete(int) {
        return;
    },
};

async function getChannel(guild: Guild, channelId: string | null) {
    if (channelId === null) return '`❌`';

    return (await guild.channels.fetch(channelId))?.toString();
}

export default listCommand;
