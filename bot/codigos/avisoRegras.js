export const aviso = async (c, mensagem) => {
    try {
        const chatId = mensagem.key.remoteJid; // ID do grupo
        const sender = mensagem.key.participant || mensagem.key.remoteJid; // Captura o remetente correto (caso o participante esteja disponível)

        // Verificar se o remetente é um administrador
        const groupMetadata = await c.groupMetadata(chatId);
        console.log('Metadados do grupo:', groupMetadata); // Log dos metadados do grupo

        const isAdmin = groupMetadata.participants.some(participant => participant.id === sender && (participant.admin === 'admin' || participant.admin === 'superadmin'));
        console.log(`Verificação de administrador - Remetente: ${sender}, É administrador? ${isAdmin}`); // Log do status de administrador

        let textoMensagem = '';
        if (mensagem.message?.conversation) {
            textoMensagem = mensagem.message.conversation; // Mensagem enviada pelo usuário
        } else if (mensagem.message?.extendedTextMessage) {
            textoMensagem = mensagem.message.extendedTextMessage.text; // Mensagem com texto (como links)
        }

        // Verificar se o texto contém #aviso e se o remetente é um administrador
        if (textoMensagem && textoMensagem.endsWith('#aviso') && isAdmin) {
            console.log('Comando #aviso detectado e autorizado para o administrador.');

            // Obter IDs de usuários mencionados
            let idsUsuarios = [];
            let mensagemCitada = null;

            if (mensagem.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const usuarioRespondido = mensagem.message.extendedTextMessage.contextInfo.participant;
                mensagemCitada = mensagem.message.extendedTextMessage.contextInfo.stanzaId;

                if (usuarioRespondido) {
                    idsUsuarios = [usuarioRespondido]; // Mencionar apenas o autor da mensagem citada
                }
            }

            let mensagemAviso = '';
            if (idsUsuarios.length === 0) {
                mensagemAviso += `\n\n🚨 *𝗔𝘃𝗶𝘀𝗼 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁𝗲!* 🚨\n`;
                mensagemAviso += `👏🍻 *DﾑMﾑS* 💃🔥 *Dﾑ* *NIGӇԵ*💃🎶🍾🍸\n\n`;
                mensagemAviso += `🚫 Não é permitido o envio de *imagens de nudez* sem a visualização única. 👎 \n\n`;
                mensagemAviso += `⚠️ Não são permitidos assuntos relacionados a *política* 🗳️, *futebol* ⚽ ou *religião* ⛪, para evitar conflitos desnecessários. \n\n`;
                mensagemAviso += `🚸 Não é permitido compartilhar *fotos de crianças* 👶 *com conotação sexual* ❌ ou marcar *fotos íntimas* com *figuras de crianças* 🔞. \n\n`;
                mensagemAviso += `⚠️ *Proibido generalizar e falar mal dos membros do grupo* soltando indiretas ou discussões sobre assuntos privados. 💬💢 Qualquer assunto pessoal deve ser resolvido no privado! 🤝💬` ;
            } else {
                mensagemAviso += `${idsUsuarios.map(id => `@${id.split('@')[0]}`).join(', ')}`;
                mensagemAviso += `\n\n🚨 *𝗔𝘃𝗶𝘀𝗼 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁𝗲!* 🚨\n`;
                mensagemAviso += `👏🍻 *DﾑMﾑS* 💃🔥 *Dﾑ* *NIGӇԵ*💃🎶🍾🍸\n\n`;
                mensagemAviso += `🚫 Não é permitido o envio de *imagens de nudez* sem a visualização única. 👎 \n\n`;
                mensagemAviso += `⚠️ Não são permitidos assuntos relacionados a *política* 🗳️, *futebol* ⚽ ou *religião* ⛪, para evitar conflitos desnecessários. \n\n`;
                mensagemAviso += `🚸 Não é permitido compartilhar *fotos de crianças* 👶 *com conotação sexual* ❌ ou marcar *fotos íntimas* com *figuras de crianças* 🔞. \n\n`;
                mensagemAviso += `⚠️ *Proibido generalizar e falar mal dos membros do grupo* soltando indiretas ou discussões sobre assuntos privados. 💬💢 Qualquer assunto pessoal deve ser resolvido no privado! 🤝💬` ;
            }

            // Envia a mensagem de aviso mencionando o usuário, se houver
            await c.sendMessage(chatId, {
                text: mensagemAviso,
                mentions: idsUsuarios.length > 0 ? idsUsuarios : [],
            });

            // Remove a mensagem mencionada (citação) se existir
            if (mensagemCitada) {
                try {
                    await c.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: mensagemCitada,
                            participant: idsUsuarios[0], // Autor da mensagem citada
                        },
                    });
                    console.log('Mensagem citada removida com sucesso.');
                } catch (error) {
                    console.error('Erro ao remover mensagem citada:', error);
                }
            }
        } else if (textoMensagem && textoMensagem.endsWith('#aviso')) {
            await c.sendMessage(chatId, {
                text: `@${sender.split('@')[0]}, você *NÃO tem permissão* para executar esse comando 🚫👨🏻‍✈️ *Ele é EXCLUSIVO dos administradores* do grupo 👏🍻 *DﾑMﾑS* 💃🔥 *Dﾑ NIGӇԵ* 💃🎶🍾🍸`,
                mentions: [sender],
            });
        }
    } catch (error) {
        console.error('Erro ao aplicar o aviso:', error);
        console.log('Detalhes da mensagem:', mensagem);
    }
};
