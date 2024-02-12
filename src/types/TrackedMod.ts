export interface TrackedMod {
    guild_id: string;
    display_name: string;
    modrinth_id: string | null;
    curseforge_id: string | null;
    modrinth_channel: string | null;
    curseforge_channel: string | null;
    modrinth_last_check: string | null;
    curseforge_last_check: string | null;
}
