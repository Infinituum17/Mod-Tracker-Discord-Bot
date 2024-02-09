import type { Project } from './projectTypes';

export interface CurseForgeProject extends Project {
    data: Data;
}
export interface Data {
    id: number;
    gameId: number;
    name: string;
    slug: string;
    links: Links;
    summary: string;
    status: number;
    downloadCount: number;
    isFeatured: boolean;
    primaryCategoryId: number;
    categories?: CategoriesEntity[] | null;
    classId: number;
    authors?: AuthorsEntity[] | null;
    logo: ScreenshotsEntityOrLogo;
    screenshots?: ScreenshotsEntityOrLogo[] | null;
    mainFileId: number;
    latestFiles?: LatestFilesEntity[] | null;
    latestFilesIndexes?:
        | LatestFilesIndexesEntityOrLatestEarlyAccessFilesIndexesEntity[]
        | null;
    latestEarlyAccessFilesIndexes?:
        | LatestFilesIndexesEntityOrLatestEarlyAccessFilesIndexesEntity[]
        | null;
    dateCreated: string;
    dateModified: string;
    dateReleased: string;
    allowModDistribution: boolean;
    gamePopularityRank: number;
    isAvailable: boolean;
    thumbsUpCount: number;
    rating: number;
}
export interface Links {
    websiteUrl: string;
    wikiUrl: string;
    issuesUrl: string;
    sourceUrl: string;
}
export interface CategoriesEntity {
    id: number;
    gameId: number;
    name: string;
    slug: string;
    url: string;
    iconUrl: string;
    dateModified: string;
    isClass: boolean;
    classId: number;
    parentCategoryId: number;
    displayIndex: number;
}
export interface AuthorsEntity {
    id: number;
    name: string;
    url: string;
}
export interface ScreenshotsEntityOrLogo {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
}
export interface LatestFilesEntity {
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes?: HashesEntity[] | null;
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    fileSizeOnDisk: number;
    downloadUrl: string;
    gameVersions?: string[] | null;
    sortableGameVersions?: SortableGameVersionsEntity[] | null;
    dependencies?: DependenciesEntity[] | null;
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    isEarlyAccessContent: boolean;
    earlyAccessEndDate: string;
    fileFingerprint: number;
    modules?: ModulesEntity[] | null;
}
export interface HashesEntity {
    value: string;
    algo: number;
}
export interface SortableGameVersionsEntity {
    gameVersionName: string;
    gameVersionPadded: string;
    gameVersion: string;
    gameVersionReleaseDate: string;
    gameVersionTypeId: number;
}
export interface DependenciesEntity {
    modId: number;
    relationType: number;
}
export interface ModulesEntity {
    name: string;
    fingerprint: number;
}
export interface LatestFilesIndexesEntityOrLatestEarlyAccessFilesIndexesEntity {
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    gameVersionTypeId: number;
    modLoader: number;
}
