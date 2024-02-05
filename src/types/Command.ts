import type {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export interface Command {
    data: SlashCommandBuilder | Omit<any, any>;
    execute(interaction: ChatInputCommandInteraction<CacheType>): void;
}
