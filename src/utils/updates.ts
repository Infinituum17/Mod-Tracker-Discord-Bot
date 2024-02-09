import { Logger } from './logger';
import { storage } from './global';
import { ModrinthAPI } from '../api/ModrinthAPI';
import { CurseForgeAPI } from '../api/CurseForgeAPI';
import { buildCurseForgeAPIEmbed, buildModrinthAPIEmbed } from './commandUtils';
import type { Client, TextChannel } from 'discord.js';
import type { TrackedMod } from '../types/TrackedMod';
import type { ModrinthProject } from '../types/ModrinthProject';
import type { ModrinthProjectVersion } from '../types/ModrinthProjectVersion';
import type { CurseForgeProject } from '../types/CurseForgeProject';
import type { CurseForgeProjectVersion } from '../types/CurseForgeProjectVersion';

const logger = new Logger('UPDATE-CHECKER');

export async function checkUpdates(client: Client<true>) {
    logger.log('Starting updates dispach...');

    const trackedMods = storage.getAllWithValidLink();

    for (const mod of trackedMods) {
        let guild;

        try {
            guild = await client.guilds.fetch(mod.guild_id);
        } catch (error) {
            continue;
        }

        let channel;

        try {
            channel = (await guild.channels.fetch(
                mod.channel!
            ))! as TextChannel;
        } catch (error) {
            continue;
        }

        const modrinthChannel = channel;
        const curseforgeChannel = channel;

        if (mod.modrinth !== null) {
            const [modrinthProject, modrinthUpdates] =
                await checkModrinthUpdates(mod);

            for (const update of modrinthUpdates) {
                modrinthChannel.send({
                    embeds: [
                        buildModrinthAPIEmbed()
                            .setTitle(`🟩 ${modrinthProject.title}`)
                            .setImage(
                                'https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/a49f8e1b-3835-4ea1-a85b-118c6425ebc3/Modrinth_Dark_Logo.png'
                            )
                            .setThumbnail(modrinthProject.icon_url)
                            .setTimestamp()
                            .setDescription(
                                `${
                                    update.name
                                } for Minecraft [${update.game_versions?.join(
                                    ', '
                                )}] has been released!`
                            ),
                    ],
                });
            }
        }

        if (mod.curseforge !== null) {
            const [curseforgeProject, curseforgeUpdates] =
                await checkCurseForgeUpdates(mod);

            for (const update of curseforgeUpdates.data!) {
                curseforgeChannel.send({
                    embeds: [
                        buildCurseForgeAPIEmbed()
                            .setTitle(`🛠️ ${curseforgeProject.data.name}`)
                            .setImage(
                                'https://cdn.apexminecrafthosting.com/img/uploads/2021/05/21163117/curseforge-logo.png'
                            )
                            .setThumbnail(
                                curseforgeProject.data.logo.thumbnailUrl
                            )
                            .setTimestamp()
                            .setDescription(
                                `${
                                    update.displayName
                                } for Minecraft [${update.gameVersions?.join(
                                    ', '
                                )}] has been released!`
                            ),
                    ],
                });
            }
        }
    }
}

async function checkModrinthUpdates(
    mod: TrackedMod
): Promise<[ModrinthProject, ModrinthProjectVersion[]]> {
    const api = new ModrinthAPI();
    const project = await api.getProject(mod.modrinth!);

    storage.setLastModrinthCheck(mod.guild_id, mod.name);

    if (mod.modrinth_last_check === null) {
        return [
            project,
            (await api.getProjectVersions(mod.modrinth!))
                .sort(
                    (v1, v2) =>
                        new Date(v2.date_published).getTime() -
                        new Date(v1.date_published).getTime()
                )
                .slice(0, 5),
        ];
    }

    const previous = new Date(mod.modrinth_last_check).getTime();
    const projectVersions = await api.getProjectVersions(mod.modrinth!);

    return [
        project,
        projectVersions.filter(
            (version) => new Date(version.date_published).getTime() > previous
        ),
    ];
}

async function checkCurseForgeUpdates(
    mod: TrackedMod
): Promise<[CurseForgeProject, CurseForgeProjectVersion]> {
    const api = new CurseForgeAPI();
    const project = await api.getProject(mod.curseforge!);

    storage.setLastCurseForgeCheck(mod.guild_id, mod.name);

    if (mod.curseforge_last_check === null) {
        const projectVersions = await api.getProjectVersions(mod.curseforge!);

        if (
            projectVersions.data === null ||
            typeof projectVersions.data === 'undefined'
        ) {
            return [project, {}];
        }

        projectVersions.data = projectVersions.data
            .sort(
                (d1, d2) =>
                    new Date(d2.fileDate).getTime() -
                    new Date(d1.fileDate).getTime()
            )
            .slice(5);

        return [project, projectVersions];
    }

    const previous = new Date(mod.curseforge_last_check).getTime();
    const projectVersions = await api.getProjectVersions(mod.curseforge!);

    if (
        projectVersions.data === null ||
        typeof projectVersions.data === 'undefined'
    ) {
        return [project, {}];
    }

    projectVersions.data = projectVersions.data.filter((version) => {
        new Date(version.fileDate).getTime() > previous;
    });

    return [project, projectVersions];
}
