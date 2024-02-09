import type { ProjectVersion } from './projectTypes';

export interface ModrinthProjectVersion extends ProjectVersion {
    name: string;
    version_number: string;
    changelog: string;
    dependencies?: Dependency[] | null;
    game_versions?: string[] | null;
    version_type: string;
    loaders?: string[] | null;
    featured: boolean;
    status: string;
    requested_status: string;
    id: string;
    project_id: string;
    author_id: string;
    date_published: string;
    downloads: number;
    changelog_url?: null;
    files?: File[] | null;
}
export interface Dependency {
    version_id: string;
    project_id: string;
    file_name: string;
    dependency_type: string;
}
export interface File {
    hashes: Hashes;
    url: string;
    filename: string;
    primary: boolean;
    size: number;
    file_type: string;
}
export interface Hashes {
    sha512: string;
    sha1: string;
}
