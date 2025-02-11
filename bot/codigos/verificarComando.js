export async function verificarComando(c, mensagem) {
    try {
        const textoMensagem = mensagem.message?.conversation ||
                              mensagem.message?.extendedTextMessage?.text ||
                              mensagem.message?.imageMessage?.caption ||
                              mensagem.message?.videoMessage?.caption ||
                              mensagem.message?.documentMessage?.caption;

        if (!textoMensagem) return;

        // Ignora mensagens com asterisco no início e no fim
        if ((textoMensagem.startsWith("*") && textoMensagem.endsWith("*")) ||
            (textoMensagem.match(/^[\p{Emoji}\u200B]/u) && textoMensagem.match(/[\p{Emoji}\u200B]$/u))) {
            return;
        }

        // Regex para identificar menções com o formato @ID@s.whatsapp.net
        const regexMençãoID = /@(\d{10,15})@s\.whatsapp\.net/g;  // Regex para capturar @id@s.whatsapp.net
        const idsMenções = textoMensagem.match(regexMençãoID);

        // Se houver menção de ID, podemos realizar ações específicas
        if (idsMenções) {
            // IDs que são permitidos ou específicos, aqui você pode adicionar os IDs que você quiser
            const adminIds = ["557192567840@s.whatsapp.net", "outroID@s.whatsapp.net"];  // IDs de administradores

            for (let id of idsMenções) {
                if (adminIds.includes(id)) {
                    await c.sendMessage(mensagem.key.remoteJid, {
                        text: `⚠️ Não é permitido mencionar administradores com o ID: ${id}.`
                    });
                    return;
                }
            }
        }

        // Verificar uso de @ ou @@ seguido de palavras não válidas (não menções e números)
        const regexArroba = /@{1,2}([a-zA-Záàãâéèêíìóòõôúùç]+)/g;  // Detecta @palavra ou @@palavra
        const palavrasComArroba = textoMensagem.match(regexArroba);

        if (palavrasComArroba) {
            for (let palavra of palavrasComArroba) {
                const palavraSemArroba = palavra.slice(1); // Remove o @ ou @@
                
                // Se não for uma menção válida ou número
                if (!palavraSemArroba.match(/^[0-9]{10,15}$/)) {  // Não é um número válido de telefone
                    await c.sendMessage(mensagem.key.remoteJid, {
                        text: `⚠️ Comando *${palavra}* não permitido. Não insista! ❌`
                    });
                    return;
                }
            }
        }

        // Comandos permitidos
        const comando = textoMensagem.split(" ")[0];
        const comandosPermitidos = ["adv", "ban", "regras", "aviso"];

        // Processa comando
        const regexComando = /^[#.$&*!%]+([a-zA-Z]+)/;
        const match = comando.match(regexComando);

        if (!match) return;

        const comandoLimpo = match[1].toLowerCase(); // Normaliza para minúsculas
        const grupoId = mensagem.key.remoteJid;
        const usuarioId = mensagem.key.participant || mensagem.participant;

        if (comandoLimpo === "menu") {
            await c.sendMessage(grupoId, {
                text: `🤖 @${usuarioId.split('@')[0]}, este bot é oficial do grupo 👏🍻 *DﾑMﾑS* 💃🔥 *Dﾑ NIGӇԵ* 💃🎶🍾🍸.\n\n` +
                      `🔒 Os comandos são restritos e apenas o dono *Lucas* pode utilizá-los.\n` +
                      `⚠️ Os comandos não são disponibilizados para terceiros.`,
                mentions: [usuarioId]
            });
        } else if (!comandosPermitidos.includes(comandoLimpo)) {
            await c.sendMessage(grupoId, {
                text: `⚠️ Comando *${comando}* proibido neste grupo. Não insista! ❌`
            });
        }
    } catch (error) {
        console.error("Erro ao verificar comando:", error);
    }
}
