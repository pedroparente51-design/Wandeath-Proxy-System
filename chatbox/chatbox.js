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
            // Determine path based on current location
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
                            <h4>Suporte Ao Vivo</h4>
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

        // Re-run lucide icons for the new elements
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

        // Toggle Chatbox
        openChatBtn.onclick = (e) => {
            e.preventDefault();
            chatboxContainer.style.display = 'flex';
            setTimeout(() => {
                chatboxContainer.classList.add('show');
                renderMessages();
                if (chatboxInput) chatboxInput.focus();
            }, 10);
        };

        if (closeChatBtn) {
            closeChatBtn.onclick = () => {
                chatboxContainer.classList.remove('show');
                setTimeout(() => chatboxContainer.style.display = 'none', 400);
            };
        }

    window.wandeathRenderChat = function() {
        const chatboxMessages = document.getElementById('chatbox-messages');
        if (!chatboxMessages) return;
        
        const history = JSON.parse(localStorage.getItem('wandeath_chat_history') || '[]');
        chatboxMessages.innerHTML = '';

        if (history.length === 0) {
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
    };

    // 2. Initialize Logic
    function initChatboxLogic() {
        const openChatBtn = document.getElementById('open-chat-btn');
        const closeChatBtn = document.getElementById('close-chat-btn');
        const chatboxContainer = document.getElementById('chatbox-container');
        const chatboxInput = document.getElementById('chatbox-input-field');
        const chatboxSendBtn = document.getElementById('chatbox-send-btn');

        if (!openChatBtn || !chatboxContainer) return;

        // Toggle Chatbox
        openChatBtn.onclick = (e) => {
            e.preventDefault();
            chatboxContainer.style.display = 'flex';
            setTimeout(() => {
                chatboxContainer.classList.add('show');
                window.wandeathRenderChat();
                if (chatboxInput) chatboxInput.focus();
            }, 10);
        };

        if (closeChatBtn) {
            closeChatBtn.onclick = () => {
                chatboxContainer.classList.remove('show');
                setTimeout(() => chatboxContainer.style.display = 'none', 400);
            };
        }

        function sendMessage() {
            if (!chatboxInput) return;
            const text = chatboxInput.value.trim();
            if (!text) return;

            const history = JSON.parse(localStorage.getItem('wandeath_chat_history') || '[]');
            history.push({ sender: 'user', text: text, timestamp: Date.now() });
            localStorage.setItem('wandeath_chat_history', JSON.stringify(history));

            chatboxInput.value = '';
            window.wandeathRenderChat();

            // Simulate admin reply (only if not real admin)
            // setTimeout(() => { ... }); 
            // Note: I'll remove the simulation to allow real admin testing between tabs
        }

        if (chatboxSendBtn) chatboxSendBtn.onclick = sendMessage;
        if (chatboxInput) {
            chatboxInput.onkeypress = (e) => {
                if (e.key === 'Enter') sendMessage();
            };
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectChatbox();
            initChatboxLogic();
        });
    } else {
        injectChatbox();
        initChatboxLogic();
    }

    // Listen for changes from other tabs (like Admin Panel)
    window.addEventListener('storage', (e) => {
        if (e.key === 'wandeath_chat_history') {
            if (window.wandeathRenderChat) {
                window.wandeathRenderChat();
            }
        }
    });

})();
