// Admin Global Functions
window.showSection = function(sectionId) {
    console.log('[Admin] Trocando para seção:', sectionId);
    
    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.id === `nav-${sectionId}`) item.classList.add('active');
    });

    // Update section visibility
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
        targetSection.style.display = (sectionId === 'chat') ? 'flex' : 'block';
        setTimeout(() => targetSection.classList.add('active'), 10);
        
        const titles = {
            'dashboard': 'Dashboard Geral',
            'chat': 'Gestão de Atendimento',
            'products': 'Gerenciar Produtos',
            'coupons': 'Gerenciar Cupons',
            'customers': 'Gestão de Clientes',
            'logs': 'Histórico de Atividades',
            'settings': 'Configurações do Site'
        };
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = titles[sectionId] || 'Painel Admin';
        
        localStorage.setItem('wandeath_admin_active_section', sectionId);

        if (sectionId === 'chat') renderAdminMessages();
        if (sectionId === 'products') renderAdminProducts();
        if (sectionId === 'coupons') renderAdminCoupons();
        if (sectionId === 'dashboard') renderDashboardMetrics();
        if (sectionId === 'customers') renderAdminCustomers();
        if (sectionId === 'logs') renderAdminLogs();
        if (sectionId === 'settings') renderAdminsList();
    }
};

window.simulateAdminOAuth = function(provider) {
    const width = 500, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    const popup = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left}`);
    
    let color = provider === 'Google' ? '#fff' : '#5865F2';
    let bg = provider === 'Google' ? '#111' : '#36393f';
    
    popup.document.write(`
        <html style="font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 50px; background: ${bg}; color: #fff;">
            <h2 style="margin-top: 40px;">Conectando com ${provider}...</h2>
            <p style="color: #aaa;">Verificando permissões de administrador.</p>
            <div style="margin: 50px auto; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.2); border-top-color: ${color}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        </html>
    `);

    setTimeout(() => {
        popup.close();
        localStorage.setItem('wandeath_admin_logged', 'true');
        location.reload();
    }, 2000);
};

// Logic functions (must be global or reachable by showSection)
let activeChatId = localStorage.getItem('wandeath_admin_active_chat');
let adminChatSubscription = null;

async function renderAdminMessages() {
    const chatMessages = document.getElementById('admin-chat-messages');
    if (!chatMessages) return;
    
    // Update active chats list in sidebar
    await renderActiveChatsList();

    if (!activeChatId) {
        chatMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); margin-top: 50px;">Selecione uma conversa ao lado para responder.</div>';
        return;
    }

    if (!window.supabaseClient) {
        chatMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); margin-top: 50px;">Erro ao conectar.</div>';
        return;
    }

    // Only show loading if we're switching chats or it's empty
    const currentMsgs = chatMessages.querySelectorAll('.chat-msg');
    if (currentMsgs.length === 0) {
        chatMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); margin-top: 50px;">Carregando mensagens...</div>';
    }

    try {
        const { data: history, error } = await window.supabaseClient
            .from('chat_messages')
            .select('*')
            .eq('session_id', activeChatId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        
        chatMessages.innerHTML = '';
        if (!history || history.length === 0) {
            chatMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); margin-top: 50px;">Aguardando mensagens...</div>';
            return;
        }
        history.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `chat-msg ${msg.sender}`;
            msgEl.textContent = msg.text;
            chatMessages.appendChild(msgEl);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Setup realtime if not done
        if (!adminChatSubscription) {
            adminChatSubscription = window.supabaseClient.channel('admin_chat')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
                    if (payload.new.session_id === activeChatId && payload.new.sender !== 'admin') {
                        if (chatMessages.innerHTML.includes('Aguardando')) chatMessages.innerHTML = '';
                        const msgEl = document.createElement('div');
                        msgEl.className = `chat-msg ${payload.new.sender}`;
                        msgEl.textContent = payload.new.text;
                        chatMessages.appendChild(msgEl);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                    renderActiveChatsList(); // Refresh list to show latest
                })
                .subscribe();
        }

    } catch(e) {
        console.error('[Wandeath] Erro carregar admin chat:', e);
    }
}

// Cache da última lista de sessões para não piscar ao re-renderizar
let _lastChatSessionsJSON = '';

async function renderActiveChatsList() {
    const list = document.querySelector('.chat-list');
    if (!list || !window.supabaseClient) return;
    
    try {
        const { data: msgs, error } = await window.supabaseClient
            .from('chat_messages')
            .select('session_id, created_at')
            .order('created_at', { ascending: false })
            .limit(200);
            
        if (error) throw error;
        if (!msgs) return; // Não limpar a lista se a resposta for nula

        // Extract unique session_ids keeping the most recent order
        const uniqueSessions = [];
        const seen = new Set();
        msgs.forEach(m => {
            if (!seen.has(m.session_id)) {
                seen.add(m.session_id);
                uniqueSessions.push(m.session_id);
            }
        });

        // Evitar re-render se nada mudou (previne flickering)
        const sessionsJSON = JSON.stringify(uniqueSessions) + '|' + activeChatId;
        if (sessionsJSON === _lastChatSessionsJSON) return;
        _lastChatSessionsJSON = sessionsJSON;

        let html = `
            <div class="chat-list-header">
                <h3>Conversas Ativas</h3>
                <span class="badge">${uniqueSessions.length}</span>
            </div>
        `;

        if (uniqueSessions.length === 0) {
            html += '<p style="font-size:12px; color:var(--text-sec); padding:20px; text-align:center;">Nenhum chat ativo.</p>';
        } else {
            uniqueSessions.forEach(id => {
                const isActive = activeChatId === id ? 'active' : '';
                html += `
                    <div class="chat-session ${isActive}" onclick="selectChat('${id}')">
                        <div class="session-avatar"><i data-lucide="user"></i></div>
                        <div class="session-info">
                            <h4>Cliente ${id.replace('session_', '').substring(0, 5)}</h4>
                            <p>Sessão Ativa</p>
                        </div>
                    </div>
                `;
            });
        }
        
        list.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    } catch(e) {
        // Em caso de erro de rede, manter a lista atual sem limpar
        console.error('[Wandeath] Erro carregar active chats (mantendo lista atual):', e);
    }
}

window.selectChat = function(id) {
    activeChatId = id;
    localStorage.setItem('wandeath_admin_active_chat', id);
    const headerInfo = document.querySelector('.session-info-header h4');
    if (headerInfo) headerInfo.textContent = `Cliente ${id.replace('session_', '').substring(0, 5)}`;
    renderAdminMessages();
};

function renderAdminProducts() {
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;
    const productsStr = localStorage.getItem('wandeath_products');
    const products = productsStr ? JSON.parse(productsStr) : [];
    adminProductsList.innerHTML = '';
    if (products.length === 0) {
        adminProductsList.innerHTML = '<p style="color: var(--text-sec);">Nenhum produto cadastrado.</p>';
        return;
    }
    products.forEach((prod, index) => {
        const card = document.createElement('div');
        card.className = 'admin-prod-card';
        card.innerHTML = `
            <img src="${prod.image || '/img-rotativa/1gb.png'}" class="admin-prod-img">
            <div class="admin-prod-info">
                <h4>${prod.name}</h4>
                <p>R$ ${parseFloat(prod.price).toFixed(2)}</p>
                <div style="font-size:10px; color:var(--text-sec); margin-top:4px;">
                    Mín: ${prod.minQty || 1} | Máx: ${prod.maxQty || 100}
                </div>
                ${prod.youtubeUrl ? `
                    <a href="${prod.youtubeUrl}" target="_blank" style="font-size:10px; color:#ff0000; display:flex; align-items:center; gap:4px; margin-top:4px; text-decoration:none; font-weight:700;">
                        <i data-lucide="external-link" style="width:10px;"></i> Ver Vídeo Tutorial
                    </a>
                ` : ''}
            </div>
            <div style="display:flex; gap:8px;">
                <button class="edit-prod-btn" onclick="editProduct(${index})" title="Editar Produto">
                    <i data-lucide="edit-3" style="width: 16px;"></i>
                </button>
                <button class="delete-prod-btn" onclick="deleteProduct(${index})" title="Excluir Produto">
                    <i data-lucide="trash-2" style="width: 16px;"></i>
                </button>
            </div>
        `;
        adminProductsList.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

let editingProductIndex = null;

window.editProduct = function(index) {
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const prod = products[index];
    if (!prod) return;

    editingProductIndex = index;
    
    // Populate form
    let cleanDesc = prod.description || '';
    let minQty = prod.minQty || 1;
    let maxQty = prod.maxQty || 100;

    const metaMatch = cleanDesc.match(/\[\[MQ:(\d+),MX:(\d+)\]\]/);
    if (metaMatch) {
        minQty = parseInt(metaMatch[1]);
        maxQty = parseInt(metaMatch[2]);
        cleanDesc = cleanDesc.replace(/\[\[MQ:(\d+),MX:(\d+)\]\]/, '').trim();
    }

    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-desc').value = cleanDesc;
    document.getElementById('prod-delivery').value = prod.delivery;
    if (document.getElementById('prod-youtube')) document.getElementById('prod-youtube').value = prod.youtubeUrl || '';
    if (document.getElementById('prod-min')) document.getElementById('prod-min').value = prod.minQty || 1;
    if (document.getElementById('prod-max')) document.getElementById('prod-max').value = prod.maxQty || 100;
    
    // Change button text
    const btn = document.getElementById('add-product-btn');
    if (btn) {
        btn.innerHTML = '<i data-lucide="save"></i> Salvar Alterações';
        if (window.lucide) lucide.createIcons();
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = async function(index) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const prod = products[index];
    
    if (window.supabaseClient && prod.id) {
        try {
            await window.supabaseClient.from('products').delete().eq('id', prod.id);
            if (window.syncProductsFromSupabase) await window.syncProductsFromSupabase();
        } catch (e) {
            console.error('Erro ao deletar:', e);
            alert('Erro ao excluir do banco de dados');
        }
    } else {
        products.splice(index, 1);
        localStorage.setItem('wandeath_products', JSON.stringify(products));
        renderAdminProducts();
    }
};

function renderAdminCoupons() {
    const list = document.getElementById('coupons-list');
    if (!list) return;
    const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
    if (coupons.length === 0) {
        list.innerHTML = '<p style="color:var(--text-sec);">Nenhum cupom cadastrado.</p>';
        return;
    }
    list.innerHTML = coupons.map((c, i) => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:15px;">
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="width:42px; height:42px; background:rgba(238,0,0,0.1); border:1px solid rgba(238,0,0,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="tag" style="width:18px; color:var(--primary);"></i>
                </div>
                <div>
                    <strong style="font-size:15px; letter-spacing:1px;">${c.name}</strong>
                    <div style="font-size:12px; color:var(--text-sec); margin-top:3px;">
                        ${c.discount}% de desconto &bull; ${c.type === 'unlimited' ? 'Ilimitado' : `${c.usesLeft} usos restantes`}
                    </div>
                </div>
            </div>
            <button onclick="deleteCoupon(${i})" class="delete-prod-btn" style="width:36px; height:36px;">
                <i data-lucide="trash-2" style="width:15px;"></i>
            </button>
        </div>`).join('');
    if (window.lucide) lucide.createIcons();
}

window.deleteCoupon = function(index) {
    const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
    coupons.splice(index, 1);
    localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
    renderAdminCoupons();
};

async function renderAdminCustomers() {
    const listBody = document.getElementById('customers-list-body');
    if (!listBody) return;

    // Mostrar loading
    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-sec);"><div class="loader" style="width:24px;height:24px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>Carregando clientes do Supabase...</td></tr>';

    const customerMap = {};
    const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');

    // 1. Buscar todos os perfis do Supabase
    if (window.supabaseClient) {
        try {
            const { data: profiles, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (profiles && profiles.length > 0) {
                profiles.forEach(p => {
                    customerMap[p.email] = {
                        name: p.full_name || p.email.split('@')[0],
                        totalSpent: 0,
                        orderCount: 0,
                        registered: true,
                        provider: p.provider || 'email',
                        createdAt: p.created_at
                    };
                });
                console.log(`[Admin] ${profiles.length} clientes carregados do Supabase.`);
            }
        } catch (err) {
            console.error('[Admin] Erro ao buscar perfis do Supabase:', err);
        }
    }

    // 2. Fallback: também ler do localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('wandeath_users') || '[]');
    registeredUsers.forEach(u => {
        if (!customerMap[u.email]) {
            customerMap[u.email] = { name: u.name, totalSpent: 0, orderCount: 0, registered: true, provider: 'local' };
        }
    });

    // 3. Enriquecer com dados de pedidos
    orders.forEach(o => {
        if (!customerMap[o.customerEmail]) {
            customerMap[o.customerEmail] = { name: o.customerName || 'Cliente', totalSpent: 0, orderCount: 0, registered: false, provider: 'unknown' };
        }
        customerMap[o.customerEmail].totalSpent += o.total || 0;
        customerMap[o.customerEmail].orderCount += 1;
    });

    const emails = Object.keys(customerMap);
    if (emails.length === 0) {
        listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-sec);">Nenhum cliente ainda.</td></tr>';
        return;
    }

    listBody.innerHTML = emails.map(email => {
        const c = customerMap[email];
        const statusMap = JSON.parse(localStorage.getItem('wandeath_customer_status') || '{}');
        const currentStatus = statusMap[email] || 'Ativo';
        
        let statusClass = 'active';
        if (currentStatus === 'Banido') statusClass = 'banned';
        if (currentStatus === 'Bloqueado') statusClass = 'blocked';

        const providerBadge = c.provider ? `<span style="font-size:8px; color:${c.provider === 'google' ? '#4285f4' : c.provider === 'discord' ? '#5865F2' : 'var(--primary)'}; border:1px solid currentColor; padding:1px 4px; border-radius:4px; margin-left:5px; text-transform:uppercase; font-weight:800;">${c.provider}</span>` : '';

        return `
            <tr>
                <td><div class="avatar-small">${c.name.charAt(0).toUpperCase()}</div></td>
                <td>${c.name} ${providerBadge}</td>
                <td>${email}</td>
                <td>R$ ${c.totalSpent.toFixed(2)}</td>
                <td><span class="status-tag ${statusClass}">${currentStatus}</span></td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button onclick="updateCustomerStatus('${email}', 'Banido')" class="btn-action ban" title="Banir Permanente">
                            <i data-lucide="user-x"></i>
                        </button>
                        <button onclick="updateCustomerStatus('${email}', 'Bloqueado')" class="btn-action block" title="Bloquear Temporariamente">
                            <i data-lucide="user-minus"></i>
                        </button>
                        <button onclick="promoteToAdmin('${email}')" class="btn-action unlock" style="background:rgba(238,0,0,0.1); border-color:var(--primary);" title="Tornar Administrador">
                            <i data-lucide="shield-check" style="color:var(--primary);"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

window.updateCustomerStatus = function(email, newStatus) {
    const statusMap = JSON.parse(localStorage.getItem('wandeath_customer_status') || '{}');
    statusMap[email] = newStatus;
    localStorage.setItem('wandeath_customer_status', JSON.stringify(statusMap));
    
    // Log Action
    addLog('Moderação de Cliente', `O cliente ${email} foi marcado como "${newStatus}".`);
    
    renderAdminCustomers();
    console.log(`[Admin] Status de ${email} alterado para: ${newStatus}`);
};

window.promoteToAdmin = function(email) {
    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[]');
    if (admins.find(a => a.email === email)) {
        alert('Este usuário já é um administrador.');
        return;
    }
    if (confirm(`Deseja realmente tornar ${email} um administrador? Ele terá acesso total ao painel.`)) {
        admins.push({ email: email });
        localStorage.setItem('wandeath_admins', JSON.stringify(admins));
        addLog('Novo Admin Promovido', `O cliente ${email} foi promovido a administrador.`);
        alert(`${email} agora é um administrador!`);
        renderAdminsList();
    }
};

async function renderDashboardMetrics() {
    let orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    
    // Normalize local dates to timestamps
    orders = orders.map(o => ({
        ...o,
        date: new Date(o.date).getTime()
    }));

    if (window.supabaseClient) {
        try {
            const { data: remoteOrders, error } = await window.supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!error && remoteOrders && remoteOrders.length > 0) {
                // Mapear para o formato esperado pelo dashboard e remover o teste
                const mappedRemote = remoteOrders
                    .filter(o => o.customer_email !== 'test@test.com')
                    .map(o => ({
                        customerEmail: o.customer_email,
                        customerName: o.customer_name,
                        productName: o.product_name,
                        qty: o.qty,
                        total: parseFloat(o.total),
                        date: new Date(o.created_at).getTime(),
                        delivery: o.delivery
                    }));
                
                // Mesclar com os dados locais, garantindo que não se percam dados antigos do localStorage
                const allOrders = [...mappedRemote, ...orders];
                
                // Opcional: remover duplicatas baseadas no timestamp/email se houver
                const uniqueOrders = [];
                const seenKeys = new Set();
                allOrders.forEach(o => {
                    const key = `${o.customerEmail}-${o.date}-${o.total}`;
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        uniqueOrders.push(o);
                    }
                });
                
                orders = uniqueOrders.sort((a, b) => b.date - a.date);
            }
        } catch (e) {
            console.warn('[Dashboard] Erro ao carregar pedidos remotos:', e);
        }
    }

    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');

    // ── 1. Vendas Hoje (filtrando por data de hoje) ──
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayOrders = orders.filter(o => o.date && o.date >= todayStart);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const salesEl = document.getElementById('metric-sales-value');
    if (salesEl) salesEl.innerText = `R$ ${todaySales.toFixed(2).replace('.', ',')}`;

    // ── 2. Receita Total ──
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const revenueEl = document.getElementById('metric-revenue-value');
    if (revenueEl) revenueEl.innerText = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;

    // ── 3. Total Clientes (Supabase profiles + localStorage fallback) ──
    let customersCount = 0;
    const customerEmails = new Set();

    if (window.supabaseClient) {
        try {
            const { data: profiles, error } = await window.supabaseClient
                .from('profiles')
                .select('email', { count: 'exact' });
            if (!error && profiles) {
                profiles.forEach(p => customerEmails.add(p.email));
            }
        } catch (e) {
            console.warn('[Dashboard] Erro ao buscar profiles:', e);
        }
    }

    // Fallback: contar de localStorage e pedidos
    const localUsers = JSON.parse(localStorage.getItem('wandeath_users') || '[]');
    localUsers.forEach(u => customerEmails.add(u.email));
    orders.forEach(o => { if (o.customerEmail) customerEmails.add(o.customerEmail); });
    customersCount = customerEmails.size;

    const customersEl = document.getElementById('metric-customers-value');
    if (customersEl) customersEl.innerText = customersCount;

    // ── 4. Conversas Ativas (Supabase chat_messages - sessões únicas) ──
    let activeChats = 0;
    if (window.supabaseClient) {
        try {
            const { data: msgs, error } = await window.supabaseClient
                .from('chat_messages')
                .select('session_id');
            if (!error && msgs) {
                const uniqueSessions = new Set(msgs.map(m => m.session_id));
                activeChats = uniqueSessions.size;
            }
        } catch (e) {
            console.warn('[Dashboard] Erro ao buscar chats:', e);
        }
    }
    const chatsEl = document.getElementById('metric-chats-value');
    if (chatsEl) chatsEl.innerText = activeChats;

    // ── 5. Total Pedidos ──
    const ordersEl = document.getElementById('metric-orders-value');
    if (ordersEl) ordersEl.innerText = orders.length;

    // ── 6. Produtos Ativos ──
    const productsEl = document.getElementById('metric-products-value');
    if (productsEl) productsEl.innerText = products.length;

    // ── 7. Gráfico de Vendas dos Últimos 7 Dias (dados reais) ──
    renderSalesChart(orders);

    // ── 8. Últimos Pedidos ──
    renderRecentOrders(orders);

    // Atualizar ícones do Lucide
    if (window.lucide) lucide.createIcons();
}

function renderSalesChart(orders) {
    const chartBars = document.getElementById('chart-bars');
    const chartYAxis = document.getElementById('chart-y-axis');
    if (!chartBars) return;

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const now = new Date();
    const days = [];

    // Gerar os últimos 7 dias (de 6 dias atrás até hoje)
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000; // 24h em ms

        const dayOrders = orders.filter(o => o.date && o.date >= dayStart && o.date < dayEnd);
        const dayTotal = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

        days.push({
            label: dayNames[d.getDay()],
            total: dayTotal,
            count: dayOrders.length,
            date: d
        });
    }

    // Encontrar valor máximo para escala do eixo Y
    const maxVal = Math.max(...days.map(d => d.total), 1); // mínimo 1 para evitar divisão por zero
    const roundedMax = Math.ceil(maxVal / 10) * 10 || 10; // Arredonda para cima em dezenas

    // Atualizar eixo Y
    if (chartYAxis) {
        const steps = [roundedMax, Math.round(roundedMax * 0.75), Math.round(roundedMax * 0.5), Math.round(roundedMax * 0.25), 0];
        chartYAxis.innerHTML = steps.map(v => `<span>R$${v}</span>`).join('');
    }

    // Renderizar barras
    chartBars.innerHTML = days.map(day => {
        const heightPercent = roundedMax > 0 ? (day.total / roundedMax) * 100 : 0;
        const isToday = day.date.toDateString() === now.toDateString();
        const barStyle = isToday ? 'background: linear-gradient(180deg, var(--primary), rgba(238,0,0,0.6));' : '';
        const tooltip = `R$ ${day.total.toFixed(2).replace('.', ',')} • ${day.count} pedido${day.count !== 1 ? 's' : ''}`;
        return `
            <div class="bar-group" title="${tooltip}">
                <div class="bar" style="height: ${Math.max(heightPercent, 2)}%; ${barStyle}" data-value="${day.total.toFixed(0)}"></div>
                <span${isToday ? ' style="color:var(--primary); font-weight:800;"' : ''}>${day.label}</span>
            </div>
        `;
    }).join('');
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recent-orders-body');
    const countEl = document.getElementById('recent-orders-count');
    if (!tbody) return;

    if (countEl) countEl.textContent = `${orders.length} pedido${orders.length !== 1 ? 's' : ''} total`;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-sec);">Nenhum pedido registrado ainda.</td></tr>';
        return;
    }

    // Mostrar os 10 pedidos mais recentes
    const recent = [...orders].sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 10);

    tbody.innerHTML = recent.map(order => {
        const date = order.date ? new Date(order.date).toLocaleDateString('pt-BR') : '—';
        const name = order.customerName || 'Visitante';
        const email = order.customerEmail || '';
        const initial = name.charAt(0).toUpperCase();
        const total = order.total ? `R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}` : '—';

        return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="avatar-small">${initial}</div>
                        <div>
                            <div style="font-weight:600; font-size:13px;">${name}</div>
                            <div style="font-size:11px; color:var(--text-sec);">${email}</div>
                        </div>
                    </div>
                </td>
                <td>${order.productName || '—'}</td>
                <td>${order.qty || 1}</td>
                <td style="font-weight:700; color:#4ade80;">${total}</td>
                <td style="color:var(--text-sec); font-size:12px;">${date}</td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.lucide) lucide.createIcons();
    
    // Background Effects (RH7 Standard)
    if (typeof initMouseGlow === 'function') initMouseGlow();
    if (typeof initNeuralNetwork === 'function') initNeuralNetwork();

    // Lista de admins padrão
    const DEFAULT_ADMINS = [
        { email: 'workpedro002@gmail.com' },
        { email: 'wandersoncalixto123@gmail.com' },
        { email: 'admin@admin.com' }
    ];

    function getAdmins() {
        const stored = localStorage.getItem('wandeath_admins');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        localStorage.setItem('wandeath_admins', JSON.stringify(DEFAULT_ADMINS));
        return DEFAULT_ADMINS;
    }

    function isEmailAdmin(email) {
        const admins = getAdmins();
        return admins.some(a => a.email === email);
    }

    const adminOverlay = document.getElementById('admin-login-overlay');
    const autoCheck = document.getElementById('admin-auto-check');
    const manualLogin = document.getElementById('admin-manual-login');
    const errMsg = document.getElementById('admin-login-error');

    // ── Resolução de autenticação ANTES de mostrar qualquer seção ──
    let adminAuthenticated = false;

    // 1. Verificação rápida via localStorage (sem piscar)
    if (localStorage.getItem('wandeath_admin_logged') === 'true') {
        const user = JSON.parse(localStorage.getItem('wandeath_user') || '{}');
        if (user.email && isEmailAdmin(user.email)) {
            adminAuthenticated = true;
        } else {
            localStorage.removeItem('wandeath_admin_logged');
        }
    }

    // 2. Se já autenticado, esconde overlay imediatamente sem nunca mostrar
    if (adminAuthenticated) {
        if (adminOverlay) adminOverlay.style.display = 'none';
    } else {
        // Precisa verificar via Supabase — mostrar overlay com loading
        if (adminOverlay) adminOverlay.style.display = 'flex';

        if (window.supabaseClient) {
            try {
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                
                if (session && session.user) {
                    const userEmail = session.user.email;
                    console.log('[Admin] Sessão Supabase detectada:', userEmail);
                    
                    if (isEmailAdmin(userEmail)) {
                        localStorage.setItem('wandeath_admin_logged', 'true');
                        localStorage.setItem('wandeath_user', JSON.stringify({
                            name: session.user.user_metadata.full_name || userEmail.split('@')[0],
                            email: userEmail
                        }));
                        adminAuthenticated = true;
                        if (adminOverlay) adminOverlay.style.display = 'none';
                        addLog('Login Admin', `Sessão iniciada por ${userEmail} (auto-detecção).`);
                    } else {
                        if (autoCheck) autoCheck.style.display = 'none';
                        if (errMsg) { errMsg.style.display = 'block'; errMsg.textContent = `O e-mail ${userEmail} não tem permissão de administrador.`; }
                        if (manualLogin) { manualLogin.style.display = 'block'; manualLogin.querySelector('p').textContent = 'Faça login com uma conta de administrador.'; }
                    }
                } else {
                    if (autoCheck) autoCheck.style.display = 'none';
                    if (manualLogin) manualLogin.style.display = 'block';
                }
            } catch (err) {
                console.error('[Admin] Erro ao verificar sessão:', err);
                if (autoCheck) autoCheck.style.display = 'none';
                if (manualLogin) manualLogin.style.display = 'block';
            }
        } else {
            const user = JSON.parse(localStorage.getItem('wandeath_user') || '{}');
            if (user.email && isEmailAdmin(user.email)) {
                localStorage.setItem('wandeath_admin_logged', 'true');
                adminAuthenticated = true;
                if (adminOverlay) adminOverlay.style.display = 'none';
            } else {
                if (autoCheck) autoCheck.style.display = 'none';
                if (manualLogin) manualLogin.style.display = 'block';
            }
        }
    }

    // ── Só inicializa seções DEPOIS da autenticação resolvida ──
    const lastSection = localStorage.getItem('wandeath_admin_active_section') || 'dashboard';
    window.showSection(lastSection);

    // Sidebar Navigation Listener
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.id && navItem.id.startsWith('nav-')) {
                e.preventDefault();
                window.showSection(navItem.id.replace('nav-', ''));
            }
        });
    }

    // Chat Send
    const sendBtn = document.getElementById('admin-chat-send');
    const chatInput = document.getElementById('admin-chat-input');
    const sendMsg = async () => {
        if (!activeChatId) return alert('Selecione uma conversa primeiro!');
        if (!window.supabaseClient) return alert('Erro de conexão!');
        const text = chatInput.value.trim();
        if (!text) return;
        
        chatInput.value = '';

        // Optimistic UI
        const chatMessages = document.getElementById('admin-chat-messages');
        if (chatMessages) {
            if (chatMessages.innerHTML.includes('Aguardando')) chatMessages.innerHTML = '';
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-msg admin';
            msgEl.textContent = text;
            chatMessages.appendChild(msgEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        try {
            await window.supabaseClient.from('chat_messages').insert([{
                session_id: activeChatId,
                sender: 'admin',
                text: text
            }]);
        } catch(e) {
            console.error('[Wandeath] Erro enviar msg:', e);
        }
    };
    if (sendBtn) sendBtn.addEventListener('click', sendMsg);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });

    // --- Add Product ---
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', async () => {
            const name = document.getElementById('prod-name').value;
            const price = document.getElementById('prod-price').value;
            const category = document.getElementById('prod-category').value;
            const description = document.getElementById('prod-desc').value;
            const delivery = document.getElementById('prod-delivery').value;
            const youtubeUrl = document.getElementById('prod-youtube') ? document.getElementById('prod-youtube').value : '';
            const minQty = parseInt(document.getElementById('prod-min')?.value) || 1;
            const maxQty = parseInt(document.getElementById('prod-max')?.value) || 100;
            const imageInput = document.getElementById('prod-image');
            
            if (!name || !price) return alert('Nome e preço são obrigatórios!');

            const defaultTags = {
                'rotativa': 'Mais vendido',
                'mobile': 'Premium',
                'fixa': 'Contingência'
            };

            let image = '';

            // Se o usuário fez upload de imagem, comprimir e converter para base64
            if (imageInput && imageInput.files && imageInput.files[0]) {
                try {
                    image = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                const MAX_HEIGHT = 800;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                    if (width > MAX_WIDTH) {
                                        height *= MAX_WIDTH / width;
                                        width = MAX_WIDTH;
                                    }
                                } else {
                                    if (height > MAX_HEIGHT) {
                                        width *= MAX_HEIGHT / height;
                                        height = MAX_HEIGHT;
                                    }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);
                                resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG
                            };
                            img.onerror = reject;
                            img.src = e.target.result;
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(imageInput.files[0]);
                    });
                } catch(e) {
                    console.error('Erro ao ler/comprimir imagem:', e);
                }
            }

            // Se está editando, manter a imagem anterior se não fez novo upload
            const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
            if (editingProductIndex !== null && (!imageInput || !imageInput.files || !imageInput.files[0])) {
                image = products[editingProductIndex].image || '';
            }
            
            const finalDescription = `${(description || 'Produto de alta qualidade.').trim()} [[MQ:${minQty},MX:${maxQty}]]`;

            const prodData = {
                name,
                price: parseFloat(price),
                category,
                tag: defaultTags[category] || 'Novo',
                description: finalDescription,
                delivery: delivery || '',
                youtubeurl: youtubeUrl || '',
                image
            };

            // Para salvar no localStorage localmente, usamos youtubeUrl (camelCase)
            const localProdData = { ...prodData, youtubeUrl: youtubeUrl || '' };
            
            // Para o Supabase, removemos colunas que podem não existir ainda no DB para evitar erro fatal
            const supabaseProdData = { ...prodData };
            delete supabaseProdData.minqty;
            delete supabaseProdData.maxqty;
            delete supabaseProdData.minQty;
            delete supabaseProdData.maxQty;

            try {
                // PRIMEIRO, salva localmente para garantir que campos que não vão pro DB (como min/max) persistam!
                if (editingProductIndex !== null) {
                    products[editingProductIndex] = { ...products[editingProductIndex], ...localProdData };
                } else {
                    products.push(localProdData);
                }
                localStorage.setItem('wandeath_products', JSON.stringify(products));

                if (window.supabaseClient) {
                    if (editingProductIndex !== null && products[editingProductIndex].id) {
                        // Update in Supabase
                        const { error } = await window.supabaseClient.from('products').update(supabaseProdData).eq('id', products[editingProductIndex].id);
                        if (error) {
                            console.error('[Supabase Update Error]', error);
                            alert('Atenção: Houve um erro no banco (' + error.message + '). O produto foi salvo apenas localmente.');
                        }
                    } else {
                        // Insert in Supabase
                        const { error } = await window.supabaseClient.from('products').insert([supabaseProdData]);
                        if (error) {
                            console.error('[Supabase Insert Error]', error);
                            alert('Atenção: Houve um erro no banco (' + error.message + '). O produto foi salvo apenas localmente.');
                        }
                    }
                    // Sincroniza do supabase de volta (vai fazer merge com o que acabamos de salvar no localStorage)
                    if (window.syncProductsFromSupabase) await window.syncProductsFromSupabase();
                }
                
                if (editingProductIndex !== null) {
                    addLog('Produto Editado', `O produto "${name}" foi atualizado.`);
                    editingProductIndex = null;
                    addProductBtn.innerHTML = '<i data-lucide="plus"></i> Cadastrar Produto';
                    if (window.lucide) lucide.createIcons();
                } else {
                    addLog('Produto Adicionado', `O produto "${name}" foi cadastrado na categoria ${category}.`);
                }
                
                // Clear form
                document.getElementById('prod-name').value = '';
                document.getElementById('prod-price').value = '';
                document.getElementById('prod-desc').value = '';
                document.getElementById('prod-delivery').value = '';
                if (document.getElementById('prod-youtube')) document.getElementById('prod-youtube').value = '';
                if (document.getElementById('prod-min')) document.getElementById('prod-min').value = '1';
                if (document.getElementById('prod-max')) document.getElementById('prod-max').value = '100';
                if (imageInput) imageInput.value = '';

                alert('Produto salvo com sucesso!');
                renderAdminProducts();
            } catch (err) {
                console.error('[Wandeath] Erro ao salvar produto:', err);
                alert('Erro ao salvar no banco de dados!');
            }
        });
    }

    // --- Add Coupon ---
    const addCouponBtn = document.getElementById('add-coupon-btn');
    const couponTypeSelect = document.getElementById('coupon-type');
    const couponLimitGroup = document.getElementById('coupon-limit-group');

    if (couponTypeSelect) {
        couponTypeSelect.addEventListener('change', () => {
            if (couponLimitGroup) {
                couponLimitGroup.style.display = couponTypeSelect.value === 'limited' ? 'flex' : 'none';
            }
        });
    }

    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', () => {
            const name = document.getElementById('coupon-name').value.trim().toUpperCase();
            const pct = document.getElementById('coupon-pct').value;
            const type = document.getElementById('coupon-type').value;
            const limit = document.getElementById('coupon-limit')?.value || 50;

            if (!name || !pct) return alert('Nome e desconto são obrigatórios!');

            const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
            coupons.push({
                name,
                discount: parseInt(pct),
                type,
                usesLeft: type === 'limited' ? parseInt(limit) : null,
                maxUses: type === 'limited' ? parseInt(limit) : null
            });
            localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
            
            // Log Action
            addLog('Cupom Criado', `O cupom "${name}" de ${pct}% foi criado.`);
            
            alert('Cupom criado!');
            renderAdminCoupons();
        });
    }

    // Initial call
    window.showSection('dashboard');
});

// Logging System
function addLog(action, details) {
    const logs = JSON.parse(localStorage.getItem('wandeath_admin_logs') || '[]');
    logs.unshift({
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        action: action,
        details: details,
        admin: 'Admin Principal'
    });
    // Keep only last 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem('wandeath_admin_logs', JSON.stringify(logs));
}

function renderAdminLogs() {
    const list = document.getElementById('admin-logs-list');
    if (!list) return;
    const logs = JSON.parse(localStorage.getItem('wandeath_admin_logs') || '[]');
    
    if (logs.length === 0) {
        list.innerHTML = '<p style="color:var(--text-sec); text-align:center; padding:20px;">Nenhuma atividade registrada.</p>';
        return;
    }

    list.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-icon"><i data-lucide="activity"></i></div>
            <div class="log-content">
                <div class="log-header">
                    <span class="log-action">${log.action}</span>
                    <span class="log-date">${log.date}</span>
                </div>
                <p class="log-details">${log.details}</p>
            </div>
            <div class="log-admin">por ${log.admin}</div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

window.clearLogs = function() {
    if (confirm('Deseja realmente limpar todo o histórico de logs?')) {
        localStorage.setItem('wandeath_admin_logs', '[]');
        renderAdminLogs();
    }
};

// Admin Management Logic
function renderAdminsList() {
    const list = document.getElementById('admins-list');
    if (!list) return;
    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[]');
    
    list.innerHTML = admins.map((admin, index) => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:12px 18px; border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:32px; height:32px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">${admin.email.charAt(0).toUpperCase()}</div>
                <div>
                    <div style="font-size:14px; font-weight:600;">${admin.email}</div>
                    <div style="font-size:11px; color:var(--text-sec);">Administrador</div>
                </div>
            </div>
            ${admin.email !== 'admin@admin.com' ? `
                <button onclick="removeAdmin(${index})" class="delete-prod-btn" style="width:30px; height:30px;">
                    <i data-lucide="user-minus" style="width:14px;"></i>
                </button>
            ` : '<span style="font-size:10px; color:var(--primary); font-weight:800; text-transform:uppercase;">Master</span>'}
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

window.addNewAdmin = function() {
    const email = document.getElementById('new-admin-email').value.trim();

    if (!email) return alert('Preencha o e-mail!');

    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[]');
    if (admins.find(a => a.email === email)) return alert('Este e-mail já é administrador!');

    admins.push({ email });
    localStorage.setItem('wandeath_admins', JSON.stringify(admins));
    
    document.getElementById('new-admin-email').value = '';

    addLog('Novo Admin Adicionado', `O e-mail ${email} foi promovido a administrador.`);
    renderAdminsList();
    alert('Novo administrador adicionado com sucesso!');
};

window.removeAdmin = function(index) {
    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[]');
    const removedEmail = admins[index].email;
    
    if (confirm(`Remover as permissões de admin de ${removedEmail}?`)) {
        admins.splice(index, 1);
        localStorage.setItem('wandeath_admins', JSON.stringify(admins));
        addLog('Admin Removido', `O administrador ${removedEmail} foi removido.`);
        renderAdminsList();
    }
};

/* ─── Efeitos Visuais (RH7 Standard) ─── */
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;
    let mouseX = 0, mouseY = 0, ballX = 0, ballY = 0;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    function animate() {
        ballX += (mouseX - ballX) * 0.1;
        ballY += (mouseY - ballY) * 0.1;
        glow.style.transform = `translate(${ballX}px, ${ballY}px)`;
        requestAnimationFrame(animate);
    }
    animate();
}

function initNeuralNetwork() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = 60;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * W; this.y = Math.random() * H; this.vx = (Math.random()-0.5)*0.5; this.vy = (Math.random()-0.5)*0.5; this.r = Math.random()*2; }
        update() { this.x += this.vx; this.y += this.vy; if(this.x<0||this.x>W)this.vx*=-1; if(this.y<0||this.y>H)this.vy*=-1; }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fillStyle = 'rgba(238,0,0,0.3)'; ctx.fill(); }
    }
    
    const spawn = () => { resize(); for(let i=0;i<COUNT;i++) particles.push(new Particle()); };
    const loop = () => { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); };
    spawn(); loop();
}

