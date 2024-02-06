import { describe, expect, test } from 'bun:test';
import { ModrinthAPI } from '../src/utils/ModrinthAPI';

describe('ModrinthAPI tests', () => {
    test('verify', async () => {
        const api = new ModrinthAPI();

        expect(await api.verify('labelling-containers')).toBeTrue();
        expect(await api.verify("the-mod-that-doesn't-exist")).toBeFalse();
    });
});
