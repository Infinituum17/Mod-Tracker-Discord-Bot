import { API } from '../classes/API';
import type { CurseForgeProjectVersion } from '../types/CurseForgeProjectVersion';
import type { CurseForgeProject } from '../types/CurseForgeProject';

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
}
