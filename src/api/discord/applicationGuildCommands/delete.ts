import { Routes, type REST } from 'discord.js';
import { logger } from '../../../utils/global';

export async function deleteGuildCommands(
    rest: REST,
    clientId: string,
    guildId: string
) {
    try {
        logger.log(
            `Deleting all application's commands from guild \`${guildId}\`...`
        );

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: [],
        });

        logger.log(
            `Successfully deleted all application's commands from guild \`${guildId}\`\n`
        );
    } catch (e) {
        logger.error(e);
    }
}
