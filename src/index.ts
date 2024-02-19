import { Client, GatewayIntentBits } from 'discord.js';
import { setIntervalAsync } from 'set-interval-async';
import { checkUpdates } from './utils/updates';
import { commands } from './utils/global';
import { logger } from './utils/global';

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
