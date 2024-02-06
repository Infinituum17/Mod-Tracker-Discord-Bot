import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import type { TrackedMod } from '../types/TrackedMod';

export class Storage {
    private db: Database;
    constructor(filename = 'storage.sqlite') {
        this.db = new Database(join(process.cwd(), filename));

        this.initDB();
    }

    private initDB() {
        this.db.run(
            `CREATE TABLE IF NOT EXISTS names (
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
            `INSERT INTO names (guild_id, name) VALUES (?, ?);`
        );

        query.run(guildId, name);
    }

    deleteMod(guildId: string, name: string): void {
        const query = this.db.prepare(
            `DELETE FROM names WHERE guild_id = ? AND name = ?`
        );

        query.run(guildId, name);
    }

    getAllTrackedMods(guildId: string): TrackedMod[] {
        const query = this.db.prepare(
            `SELECT name, channel, modrinth, curseforge FROM names WHERE names.guild_id = ?;`
        );

        return query.all(guildId) as TrackedMod[];
    }

    isRegistered(guildId: string, name: string): boolean {
        const query = this.db.prepare(
            `SELECT * FROM names WHERE names.guild_id = ? AND names.name = ? LIMIT 1;`
        );

        return query.all(guildId, name).length > 0;
    }

    setModChannel(guildId: string, name: string, channelId: string): void {
        const query = this.db.prepare(
            `UPDATE names SET channel = ? WHERE names.guild_id = ? AND names.name = ?;`
        );

        query.run(channelId, guildId, name);
    }

    setModrinthId(guildId: string, name: string, modrinthId: string) {
        const query = this.db.prepare(
            `UPDATE names SET modrinth = ? WHERE names.guild_id = ? AND names.name = ?;`
        );

        query.run(modrinthId, guildId, name);
    }

    setCurseForgeId(guildId: string, name: string, curseforgeId: string) {
        const query = this.db.prepare(
            `UPDATE names SET curseforge = ? WHERE names.guild_id = ? AND names.name = ?;`
        );

        query.run(curseforgeId, guildId, name);
    }

    getAll() {
        const query = this.db.query(`SELECT * FROM names;`);

        return query.all();
    }
}
