import { API } from './API';

export class ModrinthAPI extends API {
    public api = 'api.modrinth.com';
    public apiVersion = 'v2';
    public headers = {
        'User-Agent': 'Infinituum17/Discord-Mod-Tracker',
    };

    async verify(idOrSlug: string): Promise<boolean> {
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
}
