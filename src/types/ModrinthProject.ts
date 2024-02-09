import type { Project } from './projectTypes';

export interface ModrinthProject extends Project {
    slug: string;
    title: string;
    description: string;
    categories?: string[] | null;
    client_side: string;
    server_side: string;
    body: string;
    status: string;
    requested_status: string;
    additional_categories?: string[] | null;
    issues_url: string;
    source_url: string;
    wiki_url: string;
    discord_url: string;
    donation_urls?: DonationUrlsEntity[] | null;
    project_type: string;
    downloads: number;
    icon_url: string;
    color: number;
    thread_id: string;
    monetization_status: string;
    id: string;
    team: string;
    body_url?: null;
    moderator_message?: null;
    published: string;
    updated: string;
    approved: string;
    queued: string;
    followers: number;
    license: License;
    versions?: string[] | null;
    game_versions?: string[] | null;
    loaders?: string[] | null;
    gallery?: GalleryEntity[] | null;
}
export interface DonationUrlsEntity {
    id: string;
    platform: string;
    url: string;
}
export interface License {
    id: string;
    name: string;
    url: string;
}
export interface GalleryEntity {
    url: string;
    featured: boolean;
    title: string;
    description: string;
    created: string;
    ordering: number;
}
