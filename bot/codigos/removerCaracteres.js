export async function removerCaracteres(c, mensagem) {
    let textoMensagem = '';

    // Verificar diferentes tipos de mensagem (texto, imagem, etc.)
    if (mensagem.message?.conversation) {
        textoMensagem = mensagem.message.conversation;
    } else if (mensagem.message?.imageMessage?.caption) {
        textoMensagem = mensagem.message.imageMessage.caption;
    } else if (mensagem.message?.extendedTextMessage?.text) {
        textoMensagem = mensagem.message.extendedTextMessage.text;
    }

    // Definir as regras do grupo
    const regrasDoGrupo = [
        "📜 *REGRAS DO GRUPO!*",
        "⚠️ *LEIAM COM ATENÇÃO. O DESCUMPRIMENTO PODE RESULTAR EM REMOÇÃO.*",
        "1️⃣ *Seja Respeitoso(a):* 🤝 Respeito é essencial para a convivência.",
        "2️⃣ *Conteúdo Impróprio é Proibido:* 🚫 Evite material ofensivo.",
        "3️⃣ *Nudes Somente em Visualização Única:* 👀 Outros tipos são inadequados.",
        "4️⃣ 🚫 *Links Não São Permitidos:* 🔗 Divulgação de links proibida.",
        "5️⃣ *Evite Flood e Spam:* ⚠️ Mensagens repetitivas atrapalham o grupo.",
        "6️⃣ *Respeite os Limites do Grupo:* 🎥 Não inicie chamadas sem autorização.",
        "7️⃣ *Evite Assuntos Polêmicos:* 💬 Política, religião e futebol podem gerar discussões.",
        "8️⃣ *Proibido Figurinhas de Crianças:* 🚫 Não permitido.",
        "9️⃣ *Respeite a Privacidade:* 🔒 Trate questões pessoais no privado.",
        "🔟 *Quer falar no PV?* 📩 Peça permissão antes.",
        "1️⃣1️⃣ *Sobre Invasões:* 🚪 Bloqueie quem invadir seu PV.",
        "1️⃣2️⃣ *Se sair do grupo sem motivo, ficará 15 dias sem poder voltar." 
    ];

    // Verificar se a mensagem contém as regras do grupo
    const contemRegras = regrasDoGrupo.some(regra => textoMensagem.includes(regra));

    // Se a mensagem for maior que 980 caracteres e não for uma das regras, verificar e remover
    if (textoMensagem && textoMensagem.length > 980 && !contemRegras) {
        const grupoId = mensagem.key.remoteJid;
        let usuarioId = mensagem.key.participant || mensagem.key.remoteJid;

        // **Evitar remover o próprio bot**
        const botId = c.user.id.split(':')[0]; 
        usuarioId = usuarioId.split(':')[0];

        if (usuarioId === botId) {
            console.log("O bot detectou uma mensagem longa enviada por ele mesmo, evitando auto remoção.");
            return;
        }

        // **Obter a lista de administradores**
        const metadata = await c.groupMetadata(grupoId);
        const admins = metadata.participants
            .filter(participant => participant.admin)
            .map(admin => admin.id);

        // **Se o usuário for admin, não remover**
        if (admins.includes(usuarioId)) {
            console.log(`Usuário ${usuarioId} é admin, não pode ser removido.`);
            return;
        }

        // Apagar a mensagem
        await c.sendMessage(grupoId, { delete: mensagem.key });

        // Remover o usuário do grupo
        await c.groupParticipantsUpdate(grupoId, [usuarioId], 'remove');

        console.log(`Usuário removido: ${usuarioId}`);

        // Enviar a mensagem de remoção com menção ao usuário
        await c.sendMessage(grupoId, { 
            text: `𝚄𝚜𝚞𝚊́𝚛𝚒𝚘 @${usuarioId.split('@')[0]} 𝚛𝚎𝚖𝚘𝚟𝚒𝚍𝚘 𝚙𝚘𝚛 𝚎𝚗𝚟𝚒𝚊𝚛 𝚖𝚎𝚗𝚜𝚊𝚐𝚎𝚖𝚜 𝚕𝚘𝚗𝚐𝚊𝚜 ⚠️ 𝚚𝚞𝚎 𝚜𝚊̃𝚘 *𝚌𝚘𝚗𝚜𝚒𝚍𝚎𝚛𝚊𝚍𝚊𝚜 𝚜𝚙𝚊𝚖* 🚫`,
            mentions: [usuarioId]
        });

        console.log(`Mensagem do usuário ${usuarioId} removida por ser muito longa.`);
    }
}
