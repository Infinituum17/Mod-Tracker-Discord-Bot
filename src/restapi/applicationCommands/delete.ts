import { Routes, type REST } from 'discord.js';
import { logger } from '../../utils/global';

export async function deleteGlobalCommands(rest: REST, clientId: string) {
    try {
        logger.log("Deleting all application's commands...");

        await rest.put(Routes.applicationCommands(clientId), {
            body: [],
        });

        logger.log("Successfully deleted all application's commands\n");
    } catch (e) {
        logger.error(e);
    }
}
