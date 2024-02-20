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

        if (modrinthChannel && isModrinthOutOfDate(mod, modrinthChannel)) {
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

        if (
            curseforgeChannel &&
            isCurseForgeOutOfDate(mod, curseforgeChannel)
        ) {
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

function isModrinthOutOfDate(mod: TrackedMod, channel: TextChannel) {
    return (
        mod.modrinth_id !== null &&
        channel !== null &&
        typeof channel !== 'undefined' &&
        mod.modrinth_channel !== null
    );
}

function isCurseForgeOutOfDate(mod: TrackedMod, channel: TextChannel) {
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
        .setTitle(`🔧 ${project.title}`)
        .setAuthor({
            name: 'Modrinth API',
            iconURL:
                'https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/a49f8e1b-3835-4ea1-a85b-118c6425ebc3/Modrinth_Dark_Logo.png',
        })
        .setThumbnail(project.icon_url)
        .setTimestamp()
        .setDescription(
            `A new version of ${
                project.title
            } is now available!\n\n⚙️ **Version type**: ${
                update.version_type
            }\n🕹️ **Supported Minecraft versions:** ${update.game_versions?.join(
                ', '
            )}${
                update.loaders
                    ? `\n🪜 **Mod loaders:** ${update.loaders.join(', ')}`
                    : ''
            }${
                update.changelog
                    ? `\n\n📄 **Changelog:** ${update.changelog}`
                    : ''
            }\n`
        )
        .setURL(`https://modrinth.com/mod/${project.slug}`);
}

function buildCurseForgeEmbed(project: CurseForgeProject, update: Data) {
    return buildCurseForgeAPIEmbed()
        .setTitle(`🛠️ ${project.data.name}`)
        .setAuthor({
            name: 'CurseForge API',
            iconURL:
                'https://cdn.apexminecrafthosting.com/img/uploads/2021/05/21163117/curseforge-logo.png',
        })
        .setThumbnail(project.data.logo.thumbnailUrl)
        .setTimestamp()
        .setDescription(
            `A new version of ${
                project.data.name
            } is now available!\n\n⚙️ **Version type**: ${getCurseForgeReleaseType(
                update.releaseType
            )}\n🕹️ **Supported Minecraft versions:** ${update.gameVersions?.filter(
                (v) => /\d/gm.test(v)
            )}\n🪜 **Mod loaders:** ${update.gameVersions?.filter(
                (v) => !/\d/gm.test(v)
            )}\n`
        )
        .setURL(
            `https://curseforge.com/minecraft/mc-mods/${project.data.slug}`
        );
}

function getCurseForgeReleaseType(type: number) {
    switch (type) {
        case 1:
            return 'release';
        case 2:
            return 'beta';
        case 3:
            return 'alpha';
        default:
            return 'N/A';
    }
}

async function checkModrinthUpdates(
    mod: TrackedMod
): Promise<[ModrinthProject, ModrinthProjectVersion[]]> {
    const api = new ModrinthAPI();
    const project = await api.getProject(mod.modrinth_id!);

    if (mod.modrinth_last_check === null) {
        return [project, []];
    }

    const previous = new Date(mod.modrinth_last_check).getTime();
    const projectVersions = await api.getProjectVersions(mod.modrinth_id!);

    const newProjectVersions = projectVersions.filter(
        (version) => new Date(version.date_published).getTime() > previous
    );

    if (newProjectVersions.length > 0)
        storage.setLastModrinthCheck(mod.guild_id, mod.display_name);

    return [project, newProjectVersions];
}

async function checkCurseForgeUpdates(
    mod: TrackedMod
): Promise<[CurseForgeProject, CurseForgeProjectVersion]> {
    const api = new CurseForgeAPI();
    const project = await api.getProject(mod.curseforge_id!);

    if (mod.curseforge_last_check === null) {
        return [project, { data: [] }];
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

    if (projectVersions.data.length > 0)
        storage.setLastCurseForgeCheck(mod.guild_id, mod.display_name);

    return [project, projectVersions];
}
