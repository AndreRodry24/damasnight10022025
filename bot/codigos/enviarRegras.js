import { downloadMediaMessage } from '@whiskeysockets/baileys';

export const mencionarTodos = async (c, mensagem) => {
    try {
        const chatId = mensagem.key.remoteJid; // ID do grupo
        const grupoInfo = await c.groupMetadata(chatId); // Obter informações do grupo
        const descricaoGrupo = grupoInfo.desc ? grupoInfo.desc : '🚫 *Sem descrição definida ainda!*'; // Obter a descrição do grupo

        let textoMensagem = '';
        if (mensagem.message.conversation) {
            textoMensagem = mensagem.message.conversation; // Mensagem enviada pelo usuário
        } else if (mensagem.message.extendedTextMessage) {
            textoMensagem = mensagem.message.extendedTextMessage.text; // Mensagem com texto (como links)
        }

        // Verificar se o texto contém #regras
        if (textoMensagem && textoMensagem.endsWith('#regras')) {
            console.log('Comando #regras detectado.');

            let idsUsuarios = [];
            if (
                mensagem.message.extendedTextMessage &&
                mensagem.message.extendedTextMessage.contextInfo &&
                mensagem.message.extendedTextMessage.contextInfo.quotedMessage
            ) {
                const usuarioRespondido = mensagem.message.extendedTextMessage.contextInfo.participant;
                if (usuarioRespondido) {
                    idsUsuarios = [usuarioRespondido]; // Mencionar apenas o autor da mensagem citada
                }
            }

            let mensagemRegras = '';
            if (idsUsuarios.length === 0) {
                mensagemRegras += `✨ 𝑳𝒆𝒊𝒂 𝒂𝒕𝒆𝒏𝒕𝒂𝒎𝒆𝒏𝒕𝒆 𝒂𝒔 𝒓𝒆𝒈𝒓𝒂𝒔 𝒅𝒐 𝒈𝒓𝒖𝒑𝒐 ✨`;
                mensagemRegras += `\n 🔒𝑷𝒂𝒓𝒂 𝒏𝒂̃𝒐 𝒄𝒐𝒎𝒆𝒕𝒆𝒓 𝒊𝒏𝒇𝒓𝒂𝒄̧𝒐̃𝒆𝒔 🚫`;
                mensagemRegras += `─═ڿڰۣڿ☻ڿڰۣڿ═─💃─═ڿڰۣڿ☻ڿڰۣڿ═─ \n`;
                mensagemRegras += `\n\n${descricaoGrupo}`;
            } else {
                mensagemRegras += `${idsUsuarios.map(id => `@${id.split('@')[0]}`).join(', ')}`;
                mensagemRegras += `\n\n✨ 𝑳𝒆𝒊𝒂 𝒂𝒕𝒆𝒏𝒕𝒂𝒎𝒆𝒏𝒕𝒆 𝒂𝒔 𝒓𝒆𝒈𝒓𝒂𝒔 𝒅𝒐 𝒈𝒓𝒖𝒑𝒐 ✨`;
                mensagemRegras += `\n🔒𝑷𝒂𝒓𝒂 𝒏𝒂̃𝒐 𝒄𝒐𝒎𝒆𝒕𝒆𝒓 𝒊𝒏𝒇𝒓𝒂𝒄̧𝒐̃𝒆𝒔 🚫`;
                mensagemRegras += `─═ڿڰۣڿ☻ڿڰۣڿ═─💃─═ڿڰۣڿ☻ڿڰۣڿ═─ \n`;
                mensagemRegras += `\n\n${descricaoGrupo}`;
            }

            // Baixar a imagem do grupo e enviá-la
            try {
                const imagemGrupoBuffer = await c.profilePictureUrl(chatId, 'image');
                if (imagemGrupoBuffer) {
                    await c.sendMessage(chatId, {
                        caption: mensagemRegras,
                        image: { url: imagemGrupoBuffer },
                        mentions: idsUsuarios,
                    });
                    console.log('Mensagem de regras com imagem enviada com sucesso.');
                } else {
                    throw new Error('Imagem do grupo não disponível.');
                }
            } catch (erroImagem) {
                console.warn('Falha ao obter a imagem do grupo. Enviando mensagem sem imagem:', erroImagem);
                // Se não conseguir a imagem, envia apenas o texto
                await c.sendMessage(chatId, {
                    text: mensagemRegras,
                    mentions: idsUsuarios,
                });
            }
        }
    } catch (error) {
        console.error('Erro ao enviar regras:', error);
        console.log('Detalhes da mensagem:', mensagem);
    }
};
