import { EmbedBuilder, Guild, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger, storage } from '../utils/global';

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

        const trackedMods = storage.getAllTrackedMods(interaction.guildId!);

        const embed = new EmbedBuilder()
            .setColor(0xf83d58)
            .setTitle('🔍 Mod Tracker')
            .setThumbnail('https://i.imgur.com/HguGI4C.png');

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

        if (trackedMods.length > 0) {
            embed.addFields(fields);
        } else {
            embed.setDescription('👀 No mods are currently tracked');
        }

        await interaction.editReply({
            embeds: [embed],
        });
    },
};

async function getChannel(guild: Guild, channelId: string | null) {
    if (channelId === null) return '❌';

    return (await guild.channels.fetch(channelId))?.toString();
}

export default listCommand;
