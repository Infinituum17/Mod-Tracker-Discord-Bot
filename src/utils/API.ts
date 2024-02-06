import { logger } from './global';

export abstract class API {
    abstract api: string;
    abstract apiVersion: string;
    abstract headers:
        | string[][]
        | Record<string, string | ReadonlyArray<string>>
        | Headers;

    getAPIUrl(endpoint: string): string {
        return `https://${this.api}/${this.apiVersion}/${endpoint}`;
    }

    async fetchJson(endpoint: string, method: string): Promise<any> {
        return await (
            await fetch(this.getAPIUrl(endpoint), {
                method,
                headers: this.headers,
            })
        ).json();
    }

    abstract verify(idOrSlug: string): Promise<boolean>;
}
