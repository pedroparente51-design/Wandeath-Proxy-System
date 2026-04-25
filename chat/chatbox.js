/* ─── CHATBOX LOGIC COMPONENT ─────────────────────────────── */

function injectChatbox() {
    // 1. Inject Floating Button if it doesn't exist
    if (!document.getElementById('open-chat-btn')) {
        const btn = document.createElement('a');
        btn.href = 'javascript:void(0);';
        btn.className = 'wa-floating';
        btn.id = 'open-chat-btn';
        btn.innerHTML = '<i data-lucide="message-circle"></i>';
        document.body.appendChild(btn);
    }

    // 2. Inject Chatbox Container if it doesn't exist
    if (!document.getElementById('chatbox-container')) {
        const container = document.createElement('div');
        container.className = 'chatbox-container';
        container.id = 'chatbox-container';
        container.innerHTML = `
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
        `;
        document.body.appendChild(container);
    }

    // Initialize Lucide icons for the new elements
    if (window.lucide) lucide.createIcons();
    
    // Setup listeners
    initChatboxLogic();
}

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

    // Get unique identifier for the user
    function getUserIdentifier() {
        const userStr = localStorage.getItem('wandeath_user');
        if (userStr) {
            try {
                return JSON.parse(userStr).email;
            } catch (e) { return 'guest_' + getSessionId(); }
        }
        return 'guest_' + getSessionId();
    }

    function getSessionId() {
        let sid = sessionStorage.getItem('wandeath_sid');
        if (!sid) {
            sid = Math.random().toString(36).substring(7);
            sessionStorage.setItem('wandeath_sid', sid);
        }
        return sid;
    }

    const chatKey = `wandeath_chat_${getUserIdentifier()}`;

    // Render Messages
    function renderMessages() {
        if (!chatboxMessages) return;
        const history = JSON.parse(localStorage.getItem(chatKey) || '[]');
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
    }

    // Send Message
    function sendMessage() {
        if (!chatboxInput) return;
        const text = chatboxInput.value.trim();
        if (!text) return;

        const history = JSON.parse(localStorage.getItem(chatKey) || '[]');
        history.push({ sender: 'user', text: text, timestamp: Date.now() });
        localStorage.setItem(chatKey, JSON.stringify(history));

        // Update active chats for Admin
        const activeChats = JSON.parse(localStorage.getItem('wandeath_active_chats') || '[]');
        const userId = getUserIdentifier();
        if (!activeChats.includes(userId)) {
            activeChats.push(userId);
            localStorage.setItem('wandeath_active_chats', JSON.stringify(activeChats));
        }

        chatboxInput.value = '';
        renderMessages();

        // Simulate admin reply
        setTimeout(() => {
            const adminHistory = JSON.parse(localStorage.getItem(chatKey) || '[]');
            adminHistory.push({ sender: 'admin', text: 'Olá! Um consultor entrará em contato em breve.', timestamp: Date.now() });
            localStorage.setItem(chatKey, JSON.stringify(adminHistory));
            renderMessages();
        }, 1000);
    }

    if (chatboxSendBtn) chatboxSendBtn.onclick = sendMessage;
    if (chatboxInput) {
        chatboxInput.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }
}

// Auto-inject on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbox);
} else {
    injectChatbox();
}
