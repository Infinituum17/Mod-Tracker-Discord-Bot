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
import type {
    CurseForgeProjectVersion,
    Data,
} from '../types/CurseForgeProjectVersion';

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

        let modrinthChannel;

        if (mod.modrinth_channel !== null) {
            try {
                modrinthChannel = (await guild.channels.fetch(
                    mod.modrinth_channel
                )) as TextChannel;
            } catch (error) {}
        }

        if (modrinthChannel && !isModrinthUpdated(mod, modrinthChannel)) {
            const [modrinthProject, modrinthUpdates] =
                await checkModrinthUpdates(mod);

            for (const update of modrinthUpdates) {
                await modrinthChannel.send({
                    embeds: [buildModrinthEmbed(modrinthProject, update)],
                });
            }
        }

        let curseforgeChannel;

        if (mod.curseforge_channel !== null) {
            try {
                curseforgeChannel = (await guild.channels.fetch(
                    mod.curseforge_channel
                )) as TextChannel;
            } catch (error) {}
        }

        if (curseforgeChannel && isCurseForgeUpdated(mod, curseforgeChannel)) {
            const [curseforgeProject, curseforgeUpdates] =
                await checkCurseForgeUpdates(mod);

            if (curseforgeUpdates.data) {
                for (const update of curseforgeUpdates.data) {
                    await curseforgeChannel.send({
                        embeds: [
                            buildCurseForgeEmbed(curseforgeProject, update),
                        ],
                    });
                }
            }
        }
    }
}

function isModrinthUpdated(mod: TrackedMod, channel: TextChannel) {
    return (
        mod.modrinth_id !== null &&
        channel !== null &&
        typeof channel !== 'undefined' &&
        mod.modrinth_channel !== null
    );
}

function isCurseForgeUpdated(mod: TrackedMod, channel: TextChannel) {
    return (
        mod.curseforge_id !== null &&
        channel !== null &&
        typeof channel !== 'undefined' &&
        mod.curseforge_channel !== null
    );
}

function buildModrinthEmbed(
    project: ModrinthProject,
    update: ModrinthProjectVersion
) {
    return buildModrinthAPIEmbed()
        .setTitle(`🟩 ${project.title}`)
        .setImage(
            'https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/a49f8e1b-3835-4ea1-a85b-118c6425ebc3/Modrinth_Dark_Logo.png'
        )
        .setThumbnail(project.icon_url)
        .setTimestamp()
        .setDescription(
            `${update.name} for Minecraft [${update.game_versions?.join(
                ', '
            )}] has been released!`
        );
}

function buildCurseForgeEmbed(project: CurseForgeProject, update: Data) {
    return buildCurseForgeAPIEmbed()
        .setTitle(`🛠️ ${project.data.name}`)
        .setImage(
            'https://cdn.apexminecrafthosting.com/img/uploads/2021/05/21163117/curseforge-logo.png'
        )
        .setThumbnail(project.data.logo.thumbnailUrl)
        .setTimestamp()
        .setDescription(
            `${update.displayName} for Minecraft [${update.gameVersions?.join(
                ', '
            )}] has been released!`
        );
}

async function checkModrinthUpdates(
    mod: TrackedMod
): Promise<[ModrinthProject, ModrinthProjectVersion[]]> {
    const api = new ModrinthAPI();
    const project = await api.getProject(mod.modrinth_id!);

    storage.setLastModrinthCheck(mod.guild_id, mod.display_name);

    if (mod.modrinth_last_check === null) {
        return [
            project,
            (await api.getProjectVersions(mod.modrinth_id!))
                .sort(
                    (v1, v2) =>
                        new Date(v2.date_published).getTime() -
                        new Date(v1.date_published).getTime()
                )
                .slice(0, 5),
        ];
    }

    const previous = new Date(mod.modrinth_last_check).getTime();
    const projectVersions = await api.getProjectVersions(mod.modrinth_id!);

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
    const project = await api.getProject(mod.curseforge_id!);

    storage.setLastCurseForgeCheck(mod.guild_id, mod.display_name);

    if (mod.curseforge_last_check === null) {
        const projectVersions = await api.getProjectVersions(
            mod.curseforge_id!
        );

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
            .slice(0, 5);

        return [project, projectVersions];
    }

    const previous = new Date(mod.curseforge_last_check).getTime();
    const projectVersions = await api.getProjectVersions(mod.curseforge_id!);

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
