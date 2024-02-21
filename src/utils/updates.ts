import { Logger } from './logger';
import { storage } from './global';
import { ModrinthAPI } from '../api/ModrinthAPI';
import { CurseForgeAPI } from '../api/CurseForgeAPI';
import type { Client, Guild, TextChannel } from 'discord.js';

const logger = new Logger('UPDATE-CHECKER');

export async function checkUpdates(client: Client<true>) {
    logger.log('Starting updates dispatch...');

    const trackedMods = storage.getAllWithValidLink();

    for (const mod of trackedMods) {
        let guild;

        try {
            guild = await client.guilds.fetch(mod.guild_id);
        } catch (error) {
            continue;
        }

        const modrinthChannel = await getChannel(guild, mod.modrinth_channel);

        if (
            modrinthChannel &&
            isValid(mod.modrinth_id, modrinthChannel, mod.modrinth_channel)
        ) {
            const api = new ModrinthAPI();
            const [project, updates] = await api.getUpdates(mod);

            for (const update of updates) {
                await modrinthChannel.send(
                    ModrinthAPI.getUpdateMessage(project, update)
                );
            }
        }

        const curseforgeChannel = await getChannel(
            guild,
            mod.curseforge_channel
        );

        if (
            curseforgeChannel &&
            isValid(
                mod.curseforge_id,
                curseforgeChannel,
                mod.curseforge_channel
            )
        ) {
            const api = new CurseForgeAPI();
            const [project, updates] = await api.getUpdates(mod);

            if (updates.data) {
                for (const update of updates.data) {
                    await curseforgeChannel.send(
                        CurseForgeAPI.getUpdateMessage(project, update)
                    );
                }
            }
        }
    }
}

async function getChannel(
    guild: Guild,
    channelId: string | null
): Promise<TextChannel | null> {
    if (channelId === null) return null;

    try {
        return (await guild.channels.fetch(channelId)) as TextChannel;
    } catch (error) {
        return null;
    }
}

function isValid(
    modId: string | null,
    channel: TextChannel,
    channelId: string | null
) {
    return (
        modId !== null &&
        channel !== null &&
        typeof channel !== 'undefined' &&
        channelId !== null
    );
}
