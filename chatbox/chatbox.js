/* 
   CHATBOX COMPONENT LOGIC
   Handles HTML injection and interactivity
*/

(function() {
    // 1. Inject HTML and CSS link
    function injectChatbox() {
        // Add CSS link
        if (!document.querySelector('link[href*="chatbox.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            const isSubDir = window.location.pathname.includes('/produto/') || 
                             window.location.pathname.includes('/login/') || 
                             window.location.pathname.includes('/pedidos/') || 
                             window.location.pathname.includes('/carrinho/') ||
                             window.location.pathname.includes('/proxy/') ||
                             window.location.pathname.includes('/termos/') ||
                             window.location.pathname.includes('/politica/');
            
            link.href = isSubDir ? '../chatbox/chatbox.css' : './chatbox/chatbox.css';
            document.head.appendChild(link);
        }

        // Add HTML
        const chatHtml = `
            <!-- Floating WA Button -->
            <a href="javascript:void(0);" class="wa-floating" id="open-chat-btn">
                <i data-lucide="message-circle"></i>
            </a>

            <!-- Real-time Chatbox -->
            <div class="chatbox-container" id="chatbox-container">
                <div class="chatbox-header">
                    <div class="chatbox-header-info">
                        <i data-lucide="headset"></i>
                        <div>
                            <h4 style="display: flex; align-items: center; gap: 8px;">
                                Suporte Ao Vivo
                                <a href="https://wa.me/556296175991" target="_blank" style="color: #25D366; text-decoration: none; font-size: 18px;" title="Chamar no WhatsApp">
                                    <i data-lucide="phone"></i>
                                </a>
                            </h4>
                            <span class="status-indicator"></span><small>Online agora</small>
                        </div>
                    </div>
                    <button class="chatbox-close" id="close-chat-btn"><i data-lucide="x"></i></button>
                </div>
                <div class="chatbox-messages" id="chatbox-messages"></div>
                <div class="chatbox-input">
                    <input type="text" id="chatbox-input-field" placeholder="Digite sua mensagem...">
                    <button id="chatbox-send-btn"><i data-lucide="send"></i></button>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.id = 'chatbox-component-wrapper';
        container.innerHTML = chatHtml;
        document.body.appendChild(container);

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // 2. Initialize Logic
    function initChatboxLogic() {
        const openChatBtn = document.getElementById('open-chat-btn');
        const closeChatBtn = document.getElementById('close-chat-btn');
        const chatboxContainer = document.getElementById('chatbox-container');
        const chatboxMessages = document.getElementById('chatbox-messages');
        const chatboxInput = document.getElementById('chatbox-input-field');
        const chatboxSendBtn = document.getElementById('chatbox-send-btn');

        if (!openChatBtn || !chatboxContainer) return;

        let sessionId = localStorage.getItem('wandeath_chat_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('wandeath_chat_session_id', sessionId);
        }

        let chatSubscription = null;

        openChatBtn.onclick = (e) => {
            e.preventDefault();
            chatboxContainer.style.display = 'flex';
            setTimeout(() => {
                chatboxContainer.classList.add('show');
                renderMessages();
                if (chatboxInput) chatboxInput.focus();
                setupRealtime();
            }, 10);
        };

        if (closeChatBtn) {
            closeChatBtn.onclick = () => {
                chatboxContainer.classList.remove('show');
                setTimeout(() => chatboxContainer.style.display = 'none', 400);
            };
        }

        async function renderMessages() {
            if (!chatboxMessages) return;
            chatboxMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); font-size: 12px; margin-top: 20px;">Carregando mensagens...</div>';

            if (!window.supabaseClient) {
                chatboxMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); font-size: 12px; margin-top: 20px;">Erro ao conectar.</div>';
                return;
            }

            try {
                const { data: history, error } = await window.supabaseClient
                    .from('chat_messages')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                chatboxMessages.innerHTML = '';
                if (!history || history.length === 0) {
                    chatboxMessages.innerHTML = `<div style="text-align: center; color: var(--text-sec); font-size: 12px; margin-top: 20px;">Inicie uma conversa conosco!</div>`;
                } else {
                    history.forEach(msg => {
                        const msgEl = document.createElement('div');
                        msgEl.className = `chat-msg ${msg.sender}`;
                        msgEl.textContent = msg.text;
                        chatboxMessages.appendChild(msgEl);
                    });
                }
                chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
            } catch(e) {
                console.error('[Wandeath] Chat load error:', e);
            }
        }

        async function sendMessage() {
            if (!chatboxInput || !window.supabaseClient) return;
            const text = chatboxInput.value.trim();
            if (!text) return;

            chatboxInput.value = '';

            // Optimistic UI update
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-msg user';
            msgEl.textContent = text;
            if (chatboxMessages.innerHTML.includes('Inicie uma conversa')) chatboxMessages.innerHTML = '';
            chatboxMessages.appendChild(msgEl);
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            try {
                await window.supabaseClient.from('chat_messages').insert([{
                    session_id: sessionId,
                    sender: 'user',
                    text: text
                }]);
            } catch(e) {
                console.error('[Wandeath] Erro ao enviar mensagem:', e);
            }
        }

        function setupRealtime() {
            if (!window.supabaseClient || chatSubscription) return;
            
            chatSubscription = window.supabaseClient.channel(`chat_${sessionId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` }, (payload) => {
                    if (payload.new.sender !== 'user') {
                        if (chatboxMessages.innerHTML.includes('Inicie uma conversa')) chatboxMessages.innerHTML = '';
                        const msgEl = document.createElement('div');
                        msgEl.className = `chat-msg ${payload.new.sender}`;
                        msgEl.textContent = payload.new.text;
                        chatboxMessages.appendChild(msgEl);
                        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
                    }
                })
                .subscribe();
        }

        if (chatboxSendBtn) chatboxSendBtn.onclick = sendMessage;
        if (chatboxInput) {
            chatboxInput.onkeypress = (e) => {
                if (e.key === 'Enter') sendMessage();
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectChatbox();
            initChatboxLogic();
        });
    } else {
        injectChatbox();
        initChatboxLogic();
    }

})();
