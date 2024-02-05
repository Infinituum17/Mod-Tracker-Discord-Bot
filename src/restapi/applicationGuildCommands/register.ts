import {
    Routes,
    type REST,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { logger } from '../../utils/global';

export async function registerGuildCommands(
    rest: REST,
    clientId: string,
    guildId: string,
    commandList: RESTPostAPIChatInputApplicationCommandsJSONBody[]
) {
    try {
        logger.log(
            `Registering application's commands from guild \`${guildId}\`...`
        );

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commandList,
        });

        logger.log(
            `Successfully registered application's commands \`${guildId}\`\n`
        );
    } catch (e) {
        logger.error(e);
    }
}

// '438753802850533387'
