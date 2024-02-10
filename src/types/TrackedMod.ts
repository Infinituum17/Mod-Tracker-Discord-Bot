export interface TrackedMod {
    guild_id: string;
    name: string;
    modrinth: string | null;
    curseforge: string | null;
    modrinth_channel: string | null;
    curseforge_channel: string | null;
    modrinth_last_check: string | null;
    curseforge_last_check: string | null;
}
