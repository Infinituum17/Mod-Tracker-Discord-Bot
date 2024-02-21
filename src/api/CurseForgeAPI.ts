import { API } from '../classes/API';
import type {
    CurseForgeProjectVersion,
    Data,
} from '../types/CurseForgeProjectVersion';
import type { CurseForgeProject } from '../types/CurseForgeProject';
import { buildCurseForgeAPIEmbed } from '../utils/commandUtils';
import type { TrackedMod } from '../types/TrackedMod';
import { storage } from '../utils/global';

export class CurseForgeAPI extends API {
    public api = 'api.curseforge.com';
    public apiVersion = 'v1';
    public headers = {
        Accept: 'application/json',
        'x-api-key': process.env.CURSEFORGE_TOKEN!,
    };

    async verify(id: string): Promise<boolean> {
        const response = await fetch(this.getAPIUrl(`mods/${id}`), {
            method: 'GET',
            headers: this.headers,
        });

        return response.ok;
    }

    async getProjectVersions(id: string): Promise<CurseForgeProjectVersion> {
        const response = await fetch(this.getAPIUrl(`mods/${id}/files`), {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) throw new Error(response.statusText);

        return (await response.json()) as CurseForgeProjectVersion;
    }

    async getProject(id: string): Promise<CurseForgeProject> {
        const response = await fetch(this.getAPIUrl(`mods/${id}`), {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) throw new Error(response.statusText);

        return (await response.json()) as CurseForgeProject;
    }

    static getUpdateMessage(project: CurseForgeProject, update: Data) {
        return {
            embeds: [CurseForgeAPI.buildUpdateEmbed(project, update)],
        };
    }

    static buildUpdateEmbed(project: CurseForgeProject, update: Data) {
        let releaseType = 'N/A';

        switch (update.releaseType) {
            case 1:
                releaseType = 'release';
                break;
            case 2:
                releaseType = 'beta';
                break;
            case 3:
                releaseType = 'alpha';
                break;
        }

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
                } is now available!\n\n⚙️ **Version type**: ${releaseType}\n🕹️ **Supported Minecraft versions:** ${update.gameVersions?.filter(
                    (v) => /\d/gm.test(v)
                )}\n🪜 **Mod loaders:** ${update.gameVersions?.filter(
                    (v) => !/\d/gm.test(v)
                )}\n`
            )
            .setURL(
                `https://curseforge.com/minecraft/mc-mods/${project.data.slug}`
            );
    }

    async getUpdates(
        mod: TrackedMod
    ): Promise<[CurseForgeProject, CurseForgeProjectVersion]> {
        const project = await this.getProject(mod.curseforge_id!);

        if (mod.curseforge_last_check === null) {
            return [project, { data: [] }];
        }

        const previous = new Date(mod.curseforge_last_check).getTime();
        const projectVersions = await this.getProjectVersions(
            mod.curseforge_id!
        );

        if (
            projectVersions.data === null ||
            typeof projectVersions.data === 'undefined'
        ) {
            return [project, {}];
        }

        projectVersions.data = projectVersions.data.filter(
            ({ isAvailable, fileDate }) =>
                isAvailable && new Date(fileDate).getTime() > previous
        );

        if (projectVersions.data.length > 0)
            storage.setLastCurseForgeCheck(mod.guild_id, mod.display_name);

        return [project, projectVersions];
    }
}
