import { config } from 'dotenv';
import {
    Client,
    GatewayIntentBits,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { logger, storage } from './utils/global';
import { commands } from './utils/global';

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    logger.log(`Logged in as ${client.user!.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        commands.get(interaction.commandName)!.execute(interaction);
    } else if (interaction.isAutocomplete()) {
        if (!commands.has(interaction.commandName)) {
            return;
        }

        if (!interaction.inGuild) {
            logger.warn(
                `Can't complete command \`${interaction.commandName}\` (not in a guild)`
            );
            return;
        }

        const focused = interaction.options.getFocused(true);
        let choices: ApplicationCommandOptionChoiceData<string | number>[] = [];

        if (focused.name === 'name') {
            choices = storage
                .getAllTrackedMods(interaction.guildId!)
                .filter((mod) => mod.name.startsWith(focused.value))
                .map((mod) => ({
                    name: mod.name,
                    value: mod.name,
                }));
        }

        await interaction.respond(choices);
    }
});

client.login(process.env.TOKEN);
