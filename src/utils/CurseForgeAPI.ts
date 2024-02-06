import { config } from 'dotenv';
import { API } from './API';

config();

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
}
