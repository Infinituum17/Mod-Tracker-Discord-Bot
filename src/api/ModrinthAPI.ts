import type { ModrinthProject } from '../types/ModrinthProject';
import type { ModrinthProjectVersion } from '../types/ModrinthProjectVersion';
import { API } from '../classes/API';
import { buildModrinthAPIEmbed } from '../utils/commandUtils';
import type { TrackedMod } from '../types/TrackedMod';
import { storage } from '../utils/global';

export class ModrinthAPI extends API {
    private static rateLimit: RateLimit = {
        remainingRequests: 300,
        firstRequest: 0,
    };

    public api = 'api.modrinth.com';
    public apiVersion = 'v2';
    public headers = {
        'User-Agent': 'Infinituum17/Discord-Mod-Tracker',
    };

    static updateRateLimit(): boolean {
        if (Date.now() - 60_000 > this.rateLimit.firstRequest) {
            this.rateLimit.firstRequest = Date.now();
            this.rateLimit.remainingRequests = 300;
        }

        if (this.rateLimit.remainingRequests - 1 < 0) return false;

        this.rateLimit.remainingRequests--;

        return true;
    }

    async verify(idOrSlug: string): Promise<boolean> {
        if (!ModrinthAPI.updateRateLimit())
            throw new Error('Rate limit exceeded');

        const json = await this.fetchJson(`project/${idOrSlug}/check`, 'GET');

        if (
            json !== null &&
            typeof json !== 'undefined' &&
            typeof json.id !== 'undefined'
        ) {
            return true;
        }

        return false;
    }

    async getProjectVersions(
        idOrSlug: string
    ): Promise<ModrinthProjectVersion[]> {
        if (!ModrinthAPI.updateRateLimit())
            throw new Error('Rate limit exceeded');

        return (await this.fetchJson(
            `project/${idOrSlug}/version`,
            'GET'
        )) as ModrinthProjectVersion[];
    }

    async getProject(idOrSlug: string): Promise<ModrinthProject> {
        if (!ModrinthAPI.updateRateLimit())
            throw new Error('Rate limit exceeded');

        return await this.fetchJson(`project/${idOrSlug}`, 'GET');
    }

    static getUpdateMessage(
        project: ModrinthProject,
        update: ModrinthProjectVersion
    ) {
        return {
            embeds: [ModrinthAPI.buildUpdateEmbed(project, update)],
        };
    }

    static buildUpdateEmbed(
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

    async getUpdates(
        mod: TrackedMod
    ): Promise<[ModrinthProject, ModrinthProjectVersion[]]> {
        const project = await this.getProject(mod.modrinth_id!);

        if (mod.modrinth_last_check === null) {
            return [project, []];
        }

        const previous = new Date(mod.modrinth_last_check).getTime();
        const projectVersions = await this.getProjectVersions(mod.modrinth_id!);

        const newProjectVersions = projectVersions.filter(
            ({ date_published }) =>
                new Date(date_published).getTime() > previous
        );

        if (newProjectVersions.length > 0)
            storage.setLastModrinthCheck(mod.guild_id, mod.display_name);

        return [project, newProjectVersions];
    }
}

interface RateLimit {
    remainingRequests: number;
    firstRequest: number;
}
