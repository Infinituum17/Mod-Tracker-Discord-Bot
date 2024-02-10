import { config } from 'dotenv';
import {
    Client,
    GatewayIntentBits,
    type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { logger, storage } from './utils/global';
import { commands } from './utils/global';
import { checkUpdates } from './utils/updates';
import { setIntervalAsync } from 'set-interval-async';

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async (client) => {
    logger.log(`Logged in as ${client.user!.tag}!`);

    await checkUpdates(client);

    setIntervalAsync(async () => {
        await checkUpdates(client);
    }, 1000 * 60);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);

        if (!command) return;

        command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
        const command = commands.get(interaction.commandName);

        if (!command) return;

        command.autocomplete(interaction);
    }
});

client.login(process.env.TOKEN);
