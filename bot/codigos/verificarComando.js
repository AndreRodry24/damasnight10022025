export async function verificarComando(c, mensagem) {
    try {
        const textoMensagem = mensagem.message?.conversation ||
                              mensagem.message?.extendedTextMessage?.text ||
                              mensagem.message?.imageMessage?.caption ||
                              mensagem.message?.videoMessage?.caption ||
                              mensagem.message?.documentMessage?.caption;

        if (!textoMensagem) return;

        const comando = textoMensagem.split(" ")[0];

        const comandosPermitidos = ["adv", "ban", "regras", "aviso", "nlink"];

        const regexComando = /^[#.@$&*!%]+(\w+)$/;
        const match = comando.match(regexComando);

        if (!match) return;

        const comandoLimpo = match[1];
        const grupoId = mensagem.key.remoteJid;
        const usuarioId = mensagem.key.participant || mensagem.participant; // Captura o ID do usuário

        if (comandoLimpo === "menu") {
            await c.sendMessage(grupoId, {
                text: `🤖 @${usuarioId.split('@')[0]}, este bot é oficial do grupo 👏🍻 *DﾑMﾑS* 💃🔥 *Dﾑ NIGӇԵ* 💃🎶🍾🍸.\n\n` +
                      `🔒 Os comandos são restritos e apenas o dono *Lucas* pode utilizá-los.\n` +
                      `⚠️ Os comandos não são disponibilizados para terceiros.`,
                mentions: [usuarioId] // Menciona o usuário que enviou o comando
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
