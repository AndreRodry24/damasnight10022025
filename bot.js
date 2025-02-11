import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { removerCaracteres } from './bot/codigos/removerCaracteres.js';
import { blacklist, banUser, notifyUserRemoved, handleMessage } from './bot/codigos/blacklist.js';
import { configurarBoasVindas } from './bot/codigos/boasVindas.js';
import configurarBloqueio from './bot/codigos/bloquearUsuarios.js';
import { handleMessage as handleAdvertencias } from './bot/codigos/advertenciaGrupos.js';
import { handleAntiLink } from './bot/codigos/antilink.js';
import { verificarFlood } from './bot/codigos/antiflood.js';
import { configurarDespedida } from './bot/codigos/despedidaMembro.js';
import { handleGroupParticipantsUpdate } from './bot/codigos/avisoadm.js';
import { handleBanMessage } from './bot/codigos/banUsuario.js';
import { mencionarTodos } from './bot/codigos/enviarRegras.js';
import { aviso } from './bot/codigos/avisoRegras.js';
import { verificarComando } from './bot/codigos/verificarComando.js'; // Certifique-se de que a função está importada corretamente

async function connectToWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
            console.log("Reconectando...");
            setTimeout(() => connectToWhatsApp(), 3000);
        } else if (connection === "open") {
            console.log("Bot conectado com sucesso!");
        } else if (connection === 'connecting') {
            console.log("Tentando conectar...");
        }
    });

    configurarBloqueio(sock);

    sock.ev.on("messages.upsert", async (m) => {
        try {
            const message = m.messages[0];
            const content = message.message?.conversation || '';
            const from = message.key.remoteJid;

            // Chama a função para remover caracteres proibidos
            await removerCaracteres(sock, message);

            // Gerenciar mensagens com #ban
            await handleBanMessage(sock, message);

            // Verificar flood
            await verificarFlood(sock, from, message);

            await handleAdvertencias(sock, message);
            await handleMessage(sock, message);

            // Chama a função para mencionar todos se a mensagem tiver o comando #regras
            await mencionarTodos(sock, message);

            // Verificar links
            const groupMeta = await sock.groupMetadata(from);
            const adminNumbers = groupMeta.participants
                .filter(participant => participant.isAdmin)
                .map(admin => admin.id);

            await handleAntiLink(sock, message, from, adminNumbers);

            // Chama a função de aviso, caso a mensagem contenha #aviso
            await aviso(sock, message);

            // Verificar comando
            await verificarComando(sock, message);  // Aqui estamos chamando a função para verificar o comando
            console.log("Comando verificado.");

        } catch (err) {
            console.error("Erro ao processar mensagens:", err);
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id: groupId, participants, action } = update;

        await handleGroupParticipantsUpdate(sock, update, sock.info);

        if (action === 'add') {
            for (let participant of participants) {
                if (blacklist.includes(participant)) {
                    console.log(`Usuário ${participant} encontrado na blacklist. Removendo...`);
                    await banUser(sock, groupId, participant);
                    await notifyUserRemoved(sock, groupId, participant);
                } else {
                    console.log(`Enviando boas-vindas para ${participant}...`);
                    await configurarBoasVindas(sock, groupId, participant);
                }
            }
        } else if (action === 'remove') {
            for (let participant of participants) {
                console.log(`Enviando mensagem de despedida para ${participant}...`);
                await configurarDespedida(sock, groupId, participant);
            }
        }
    });
}

connectToWhatsApp().catch(err => {
    console.error("Erro ao conectar:", err);
});
