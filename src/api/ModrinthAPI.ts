import type { ModrinthProject } from '../types/ModrinthProject';
import type { ModrinthProjectVersion } from '../types/ModrinthProjectVersion';
import { API } from '../classes/API';

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
}

interface RateLimit {
    remainingRequests: number;
    firstRequest: number;
}
