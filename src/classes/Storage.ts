import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import type { TrackedMod } from '../types/TrackedMod';

export class Storage {
    private db: Database;
    private tableName: string;

    constructor(filename = 'storage.sqlite') {
        this.db = new Database(join(process.cwd(), filename));
        this.tableName = 'tracked_mods';

        this.initDB();
    }

    private initDB() {
        this.db.run(
            `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                guild_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                modrinth_channel TEXT,
                curseforge_channel TEXT,
                modrinth_id TEXT,
                curseforge_id TEXT,
                modrinth_last_check TEXT,
                curseforge_last_check TEXT,
                PRIMARY KEY (guild_id, display_name)
            );`
        );
    }

    registerMod(guildId: string, displayName: string): void {
        const query = this.db.prepare(
            `INSERT INTO ${this.tableName} (guild_id, display_name) VALUES (?, ?);`
        );

        query.run(guildId, displayName);
    }

    deleteMod(guildId: string, displayName: string): void {
        const query = this.db.prepare(
            `DELETE FROM ${this.tableName} WHERE guild_id = ? AND display_name = ?`
        );

        query.run(guildId, displayName);
    }

    getAllTrackedMods(guildId: string): TrackedMod[] {
        const query = this.db.prepare(
            `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.guild_id = ?;`
        );

        return query.all(guildId) as TrackedMod[];
    }

    isRegistered(guildId: string, displayName: string): boolean {
        const query = this.db.prepare(
            `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ? LIMIT 1;`
        );

        return query.all(guildId, displayName).length > 0;
    }

    setModrinthChannel(
        guildId: string,
        displayName: string,
        channelId: string
    ): void {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET modrinth_channel = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ?;`
        );

        query.run(channelId, guildId, displayName);
    }

    setCurseForgeChannel(
        guildId: string,
        displayName: string,
        channelId: string
    ): void {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET curseforge_channel = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ?;`
        );

        query.run(channelId, guildId, displayName);
    }

    setModrinthId(guildId: string, displayName: string, modrinthId: string) {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET modrinth_id = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ?;`
        );

        query.run(modrinthId, guildId, displayName);
    }

    setCurseForgeId(
        guildId: string,
        displayName: string,
        curseforgeId: string
    ) {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET curseforge_id = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ?;`
        );

        query.run(curseforgeId, guildId, displayName);
    }

    setLastModrinthCheck(guildId: string, displayName: string) {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET modrinth_last_check = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ?`
        );

        query.run(new Date().getTime(), guildId, displayName);
    }

    setLastCurseForgeCheck(guildId: string, displayName: string) {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET curseforge_last_check = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.display_name = ?`
        );

        query.run(new Date().getTime(), guildId, displayName);
    }

    getAll(): TrackedMod[] {
        const query = this.db.prepare(`SELECT * FROM ${this.tableName};`);

        return query.all() as TrackedMod[];
    }

    getAllWithValidLink(): TrackedMod[] {
        const query = this.db.prepare(
            `SELECT * FROM ${this.tableName} WHERE (${this.tableName}.curseforge_id IS NOT NULL AND ${this.tableName}.curseforge_channel IS NOT NULL) OR (${this.tableName}.modrinth_id IS NOT NULL AND ${this.tableName}.modrinth_channel IS NOT NULL);`
        );

        return query.all() as TrackedMod[];
    }
}
