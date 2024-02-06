import type { ProjectVersion } from './ProjectVersions';

export interface CurseForgeProjectVersion extends ProjectVersion {
    data?: Data[] | null;
    pagination: Pagination;
}
export interface Data {
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes?: Hash[] | null;
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    fileSizeOnDisk: number;
    downloadUrl: string;
    gameVersions?: string[] | null;
    sortableGameVersions?: GameVersion[] | null;
    dependencies?: Dependency[] | null;
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    isEarlyAccessContent: boolean;
    earlyAccessEndDate: string;
    fileFingerprint: number;
    modules?: Module[] | null;
}
export interface Hash {
    value: string;
    algo: number;
}
export interface GameVersion {
    gameVersionName: string;
    gameVersionPadded: string;
    gameVersion: string;
    gameVersionReleaseDate: string;
    gameVersionTypeId: number;
}
export interface Dependency {
    modId: number;
    relationType: number;
}
export interface Module {
    name: string;
    fingerprint: number;
}
export interface Pagination {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
}
