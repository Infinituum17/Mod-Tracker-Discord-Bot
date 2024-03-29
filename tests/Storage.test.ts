import { describe, test, expect, afterAll } from 'bun:test';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { Storage } from '../src/classes/Storage';
import type { TrackedMod } from '../src/types/TrackedMod';

describe('Storage tests', () => {
    test('creation', async () => {
        const storage = new Storage('test.db.sqlite');

        expect(
            await Bun.file(join(process.cwd(), 'test.db.sqlite')).exists()
        ).toBeTrue();
    });

    test('registration', () => {
        const storage = new Storage('test.db.sqlite');

        storage.registerMod('0', 'mod0');

        expect(storage.isRegistered('0', 'mod0')).toBeTrue();
        expect(storage.getAll().length).toBe(1);

        for (let i = 1; i < 20; i++) {
            storage.registerMod(`${i}`, `mod${i}`);
        }

        expect(storage.isRegistered('1', 'mod2')).toBeFalse();
        expect(storage.getAll().length).toBe(20);
    });

    test('deletion', () => {
        const storage = new Storage('test.db.sqlite');

        storage.deleteMod('0', `mod0`);

        expect(storage.getAll().length).toBe(19);

        for (let i = 1; i < 20; i++) {
            storage.deleteMod(`${i}`, `mod${i}`);
        }

        expect(storage.getAll().length).toBe(0);
    });

    test('insertion', () => {
        const storage = new Storage('test.db.sqlite');

        storage.registerMod('0', 'mod0');

        storage.setModrinthId('0', 'mod0', '1');
        storage.setCurseForgeId('0', 'mod0', '2');
        storage.setCurseForgeChannel('0', 'mod0', '3');
        storage.setModrinthChannel('0', 'mod0', '3');
        storage.setLastModrinthCheck('0', 'mod0');
        storage.setLastCurseForgeCheck('0', 'mod0');

        const mods = storage.getAll() as TrackedMod[];

        expect(mods.length).toBe(1);
        expect(mods[0].display_name).toBe('mod0');
        expect(mods[0].modrinth_id).toBe('1');
        expect(mods[0].curseforge_id).toBe('2');
        expect(mods[0].curseforge_channel).toBe('3');
        expect(mods[0].modrinth_channel).toBe('3');

        expect(mods[0].modrinth_last_check).toBeNumber();
        expect(mods[0].curseforge_last_check).toBeNumber();

        storage.deleteMod('0', 'mod0');
    });

    test('grouping', () => {
        const storage = new Storage('test.db.sqlite');

        for (let i = 0; i < 3; i++) {
            storage.registerMod('0', `${i}`);
        }

        expect(storage.getAll().length).toBe(3);
        expect(storage.getAllTrackedMods('0').length).toBe(3);

        for (let i = 0; i < 3; i++) {
            storage.deleteMod('0', `${i}`);
        }
    });

    afterAll(async () => {
        await unlink(join(process.cwd(), 'test.db.sqlite'));
    });
});
