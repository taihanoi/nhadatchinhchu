/**
 * LOCAL AI CHATBOT - GPT STYLE (Dark/Modern)
 * Giao diện giống ChatGPT, hiệu ứng gõ chữ, tự học dữ liệu website.
 */

(function() {
    // 1. CHÈN CSS (Phong cách ChatGPT Dark Mode)
    const style = document.createElement('style');
    style.innerHTML = `
        /* GPT Colors */
        :root {
            --gpt-bg: #343541;
            --gpt-sidebar: #202123;
            --gpt-user: #40414F;
            --gpt-bot: #444654;
            --gpt-text: #ECECF1;
            --gpt-border: #565869;
            --gpt-green: #10A37F;
        }

        #gpt-widget-root {
            font-family: 'Söhne', 'ui-sans-serif', 'system-ui', -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', sans-serif;
            z-index: 9999;
        }

        /* Nút mở Chat */
        .gpt-launcher {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
        .gpt-launcher:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(16, 163, 127, 0.4); }

        /* Cửa sổ Chat */
        .gpt-window {
            background-color: var(--gpt-bg);
            color: var(--gpt-text);
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
            border: 1px solid var(--gpt-border);
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gpt-window.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        /* Tin nhắn */
        .msg-row {
            padding: 20px 16px;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            display: flex;
            gap: 12px;
            font-size: 14px;
            line-height: 1.6;
        }
        .msg-row.user { background-color: var(--gpt-bg); }
        .msg-row.bot { background-color: var(--gpt-bot); }
        
        /* Avatar */
        .avatar {
            width: 30px; height: 30px; border-radius: 2px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .avatar.user-avt { background: #5436DA; border-radius: 4px; }
        .avatar.bot-avt { background: var(--gpt-green); border-radius: 4px; }

        /* Input Area */
        .gpt-input-area {
            background: var(--gpt-bg);
            border-top: 1px solid var(--gpt-border);
            padding: 16px;
        }
        .gpt-input-box {
            background: #40414F;
            border: 1px solid rgba(32,33,35,0.5);
            color: white;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            width: 100%;
            padding: 12px 40px 12px 16px;
            outline: none;
            resize: none;
            font-family: inherit;
            height: 48px;
            line-height: 24px;
        }
        .gpt-input-box:focus { border-color: rgba(0,0,0,0.5); box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        
        /* Typing Cursor */
        .cursor::after { content: '▋'; display: inline-block; animation: blink 1s infinite; margin-left: 2px; color: var(--gpt-green); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        /* Scrollbar */
        .gpt-scroll::-webkit-scrollbar { width: 6px; }
        .gpt-scroll::-webkit-scrollbar-track { background: var(--gpt-bg); }
        .gpt-scroll::-webkit-scrollbar-thumb { background: #565869; border-radius: 3px; }
        .gpt-scroll::-webkit-scrollbar-thumb:hover { background: #8e8ea0; }
    `;
    document.head.appendChild(style);

    // 2. HTML STRUCTURE
    const html = `
    <div id="gpt-widget-root">
        <div class="fixed bottom-6 left-6 z-50 group">
            <div id="gpt-tooltip" class="absolute bottom-full left-0 mb-3 w-48 p-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-700 text-center">
                AI Assistant 2.0 (Local)
            </div>
            <button onclick="window.toggleGPT()" class="gpt-launcher w-14 h-14 rounded-full bg-[#10A37F] flex items-center justify-center text-white cursor-pointer relative overflow-hidden">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="28" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><path d="M4.93 19.07a2 2 0 0 1 0-2.83l1.41-1.41a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-1.41 1.41a2 2 0 0 1-2.83 0z"></path><path d="M19.07 4.93a2 2 0 0 1 2.83 0l1.41 1.41a2 2 0 0 1 0 2.83l-1.41 1.41a2 2 0 0 1-2.83 0l-1.41-1.41a2 2 0 0 1 0-2.83z"></path><path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path><path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path><path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"></path><rect x="9" y="9" width="6" height="6" rx="1"></rect></svg>
            </button>
        </div>

        <div id="gpt-window" class="gpt-window fixed bottom-24 left-6 w-[95vw] md:w-[400px] h-[600px] max-h-[75vh] rounded-lg flex flex-col z-50">
            <div class="flex items-center justify-between px-4 py-3 border-b border-[#565869] bg-[#343541]">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-gray-200">Nhà Đất AI Assistant</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-[#FAE69E] text-[#343541] font-bold">PLUS</span>
                </div>
                <div class="flex gap-3 text-gray-400">
                    <button onclick="window.clearChat()" class="hover:text-white transition" title="New Chat"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" height="18" width="18"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    <button onclick="window.toggleGPT()" class="hover:text-white transition"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" height="18" width="18"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
            </div>

            <div id="gpt-messages" class="flex-1 overflow-y-auto gpt-scroll bg-[#343541]">
                <div class="h-full flex flex-col items-center justify-center text-center p-6 opacity-60" id="gpt-intro">
                    <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4"><svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" height="24" width="24" class="text-gray-300"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><rect x="9" y="9" width="6" height="6" rx="1"></rect></svg></div>
                    <h3 class="text-lg font-semibold mb-6">Khả năng</h3>
                    <div class="space-y-3 w-full">
                        <button onclick="window.sendGPT('Giá nhà ở Long Biên?')" class="w-full bg-[#40414F] hover:bg-[#2A2B32] p-3 rounded text-sm transition">"Giá nhà ở Long Biên?" →</button>
                        <button onclick="window.sendGPT('Tư vấn phong thủy?')" class="w-full bg-[#40414F] hover:bg-[#2A2B32] p-3 rounded text-sm transition">"Tư vấn phong thủy?" →</button>
                        <button onclick="window.sendGPT('Quy trình mua bán?')" class="w-full bg-[#40414F] hover:bg-[#2A2B32] p-3 rounded text-sm transition">"Quy trình mua bán?" →</button>
                    </div>
                </div>
            </div>

            <div class="gpt-input-area relative">
                <input type="text" id="gpt-input" class="gpt-input-box" placeholder="Gửi tin nhắn..." autocomplete="off">
                <button onclick="window.handleGPT()" class="absolute right-6 top-[28px] text-gray-400 hover:text-white transition">
                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" height="20" width="20"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            <div class="text-[10px] text-center py-2 text-gray-500 bg-[#343541]">Dữ liệu được thu thập tự động từ nội dung website.</div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // 3. LOGIC XỬ LÝ
    let knowledge = [];
    const chatWin = document.getElementById('gpt-window');
    const msgs = document.getElementById('gpt-messages');
    const input = document.getElementById('gpt-input');
    const intro = document.getElementById('gpt-intro');
    let isOpen = false;

    // CRAWLER: Học dữ liệu
    function learn() {
        const els = document.querySelectorAll('main h1, main h2, main p, main li, .prose');
        els.forEach(el => {
            const txt = el.innerText.trim();
            if (txt.length > 30) knowledge.push(txt);
        });
        console.log(`GPT Local: Learned ${knowledge.length} contexts.`);
    }
    setTimeout(learn, 1000);

    // AI FINDER
    function getAnswer(q) {
        const words = q.toLowerCase().split(' ');
        let bestText = "";
        let maxScore = 0;

        knowledge.forEach(txt => {
            let score = 0;
            words.forEach(w => { if (txt.toLowerCase().includes(w)) score++; });
            if (score > maxScore) { maxScore = score; bestText = txt; }
        });

        if (maxScore > 0) return bestText;
        if (q.includes("chào")) return "Xin chào! Tôi là trợ lý ảo AI chuyên về Bất động sản Long Biên. Tôi có thể giúp gì cho bạn?";
        if (q.includes("liên hệ") || q.includes("số")) return "Bạn có thể liên hệ trực tiếp qua Hotline: 0845 622 012.";
        return "Xin lỗi, tôi chưa tìm thấy thông tin cụ thể trong dữ liệu hiện tại. Bạn vui lòng thử câu hỏi khác hoặc gọi 0845 622 012 nhé.";
    }

    // TYPEWRITER EFFECT (Hiệu ứng gõ chữ)
    function typeText(element, text, speed = 15) {
        let i = 0;
        element.classList.add('cursor');
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                msgs.scrollTop = msgs.scrollHeight; // Auto scroll
                setTimeout(type, speed);
            } else {
                element.classList.remove('cursor');
            }
        }
        type();
    }

    // GLOBAL FUNCTIONS
    window.toggleGPT = function() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWin.classList.add('active');
            setTimeout(() => input.focus(), 300);
        } else {
            chatWin.classList.remove('active');
        }
    };

    window.sendGPT = function(txt) {
        if(intro) intro.style.display = 'none';
        
        // 1. User Message
        const userRow = document.createElement('div');
        userRow.className = 'msg-row user';
        userRow.innerHTML = `
            <div class="avatar user-avt"><svg stroke="white" fill="none" stroke-width="2" viewBox="0 0 24 24" height="16" width="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
            <div class="text-gray-200">${txt}</div>
        `;
        msgs.appendChild(userRow);

        // 2. Bot Processing (Bot container empty first)
        const botRow = document.createElement('div');
        botRow.className = 'msg-row bot';
        botRow.innerHTML = `
            <div class="avatar bot-avt"><svg stroke="white" fill="none" stroke-width="2" viewBox="0 0 24 24" height="16" width="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
            <div class="bot-content text-gray-200 leading-7" style="min-height: 24px"></div>
        `;
        msgs.appendChild(botRow);
        msgs.scrollTop = msgs.scrollHeight;

        // 3. Generate Answer & Type
        const ans = getAnswer(txt);
        const botContent = botRow.querySelector('.bot-content');
        
        setTimeout(() => {
            typeText(botContent, ans);
        }, 600);
    };

    window.handleGPT = function() {
        const txt = input.value.trim();
        if (!txt) return;
        window.sendGPT(txt);
        input.value = '';
    };

    window.clearChat = function() {
        msgs.innerHTML = ''; // Clear all
        if(intro) {
            intro.style.display = 'flex'; // Restore intro
            msgs.appendChild(intro);
        }
    };

    input.addEventListener('keypress', (e) => { if(e.key === 'Enter') window.handleGPT(); });

})();
