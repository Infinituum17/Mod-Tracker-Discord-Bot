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
                name TEXT NOT NULL,
                channel TEXT,
                modrinth TEXT,
                curseforge TEXT,
                modrinth_last_check TEXT,
                curseforge_last_check TEXT,
                PRIMARY KEY (guild_id, name)
            );`
        );
    }

    registerMod(guildId: string, name: string): void {
        const query = this.db.prepare(
            `INSERT INTO ${this.tableName} (guild_id, name) VALUES (?, ?);`
        );

        query.run(guildId, name);
    }

    deleteMod(guildId: string, name: string): void {
        const query = this.db.prepare(
            `DELETE FROM ${this.tableName} WHERE guild_id = ? AND name = ?`
        );

        query.run(guildId, name);
    }

    getAllTrackedMods(guildId: string): TrackedMod[] {
        const query = this.db.prepare(
            `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.guild_id = ?;`
        );

        return query.all(guildId) as TrackedMod[];
    }

    isRegistered(guildId: string, name: string): boolean {
        const query = this.db.prepare(
            `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.name = ? LIMIT 1;`
        );

        return query.all(guildId, name).length > 0;
    }

    setModChannel(guildId: string, name: string, channelId: string): void {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET channel = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.name = ?;`
        );

        query.run(channelId, guildId, name);
    }

    setModrinthId(guildId: string, name: string, modrinthId: string) {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET modrinth = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.name = ?;`
        );

        query.run(modrinthId, guildId, name);
    }

    setCurseForgeId(guildId: string, name: string, curseforgeId: string) {
        const query = this.db.prepare(
            `UPDATE ${this.tableName} SET curseforge = ? WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.name = ?;`
        );

        query.run(curseforgeId, guildId, name);
    }

    setLastModrinthCheck(guildId: string, name: string) {
        const query = this.db.query(
            `UPDATE ${this.tableName} SET modrinth_last_check = datetime('now', 'localtime') WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.name = ?`
        );

        query.run(guildId, name);
    }

    setLastCurseForgeCheck(guildId: string, name: string) {
        const query = this.db.query(
            `UPDATE ${this.tableName} SET curseforge_last_check = datetime('now', 'localtime') WHERE ${this.tableName}.guild_id = ? AND ${this.tableName}.name = ?`
        );

        query.run(guildId, name);
    }

    getAll() {
        const query = this.db.query(`SELECT * FROM ${this.tableName};`);

        return query.all();
    }
}
