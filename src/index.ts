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
