import { describe, test, expect } from 'bun:test';
import { CurseForgeAPI } from '../src/utils/CurseForgeAPI';

describe('CurseForgeAPI tests', () => {
    test('verify', async () => {
        const api = new CurseForgeAPI();

        expect(await api.verify('844270')).toBeTrue();
        expect(await api.verify('844270414122')).toBeFalse();
    });
});
