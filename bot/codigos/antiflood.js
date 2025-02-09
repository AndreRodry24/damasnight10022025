const userMessageCount = new Map(); // Armazena o histórico de mensagens por usuário

const ANTI_FLOOD_TIME = 10000; // Intervalo de tempo (10 segundos)
const MAX_MESSAGES = 10; // Limite máximo de mensagens permitido no intervalo

/**
 * Verifica se o usuário excedeu o limite de mensagens permitido
 * e aplica a punição em caso de flood.
 */
export async function verificarFlood(bot, chatId, message) {
    const sender = message.key.participant || message.key.remoteJid; // Identifica o remetente da mensagem

    // Ignorar mensagens do bot ou mensagens sem remetente identificado
    if (!sender || bot.user.jid === sender) return;

    // Inicializa o histórico de mensagens do usuário, caso ainda não exista
    if (!userMessageCount.has(sender)) {
        userMessageCount.set(sender, { timestamps: [] });
    }

    const now = Date.now(); // Timestamp atual
    const userHistory = userMessageCount.get(sender);

    // Verifica se o último intervalo entre a última mensagem e a nova é maior que o limite de 10 segundos
    if (userHistory.timestamps.length > 0 && now - userHistory.timestamps[userHistory.timestamps.length - 1] > ANTI_FLOOD_TIME) {
        // Se houver intervalo maior que 10 segundos, reseta o contador
        userHistory.timestamps = [now]; // Mantém apenas a última mensagem
    } else {
        // Se o intervalo de 10 segundos não foi ultrapassado, adiciona o timestamp da nova mensagem
        userHistory.timestamps.push(now);
    }

    // Verifica se o número de mensagens é maior que o limite de 10
    if (userHistory.timestamps.length > MAX_MESSAGES) {
        // Remove a primeira mensagem se o número de mensagens exceder 10
        userHistory.timestamps.shift();
    }

    // Verifica se as 10 mensagens foram enviadas dentro do intervalo de 10 segundos
    const firstMessageTime = userHistory.timestamps[0];
    const lastMessageTime = userHistory.timestamps[userHistory.timestamps.length - 1];

    // Se as 10 mensagens foram enviadas dentro do intervalo de 10 segundos, é flood
    if (userHistory.timestamps.length === MAX_MESSAGES && lastMessageTime - firstMessageTime <= ANTI_FLOOD_TIME) {
        await aplicarPunicaoPorFlood(bot, chatId, sender);
    }
}

/**
 * Aplica a punição ao usuário que cometeu flood.
 */
async function aplicarPunicaoPorFlood(bot, chatId, user) {
    try {
        // Remove o usuário do grupo
        await bot.groupParticipantsUpdate(chatId, [user], 'remove');

        // Limpa o histórico de mensagens do usuário
        userMessageCount.delete(user);

        console.log(`Usuário ${user} foi removido do grupo ${chatId} por flood.`);
    } catch (error) {
        console.error('Erro ao aplicar punição por flood:', error);
    }
}
