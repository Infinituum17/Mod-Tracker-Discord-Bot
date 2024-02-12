import type {
    AutocompleteInteraction,
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export interface Command {
    data: SlashCommandBuilder | Omit<any, any>;
    execute(int: ChatInputCommandInteraction<CacheType>): void;
    autocomplete(int: AutocompleteInteraction<CacheType>): void;
}
