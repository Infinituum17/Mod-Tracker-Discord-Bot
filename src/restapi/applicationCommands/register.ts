import {
    Routes,
    type REST,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { logger } from '../../utils/global';

export async function registerGlobalCommands(
    rest: REST,
    clientId: string,
    commandList: RESTPostAPIChatInputApplicationCommandsJSONBody[]
) {
    try {
        logger.log("Registering application's commands...");

        await rest.put(Routes.applicationCommands(clientId), {
            body: commandList,
        });

        logger.log("Successfully registered application's commands\n");
    } catch (e) {
        logger.error(e);
    }
}
