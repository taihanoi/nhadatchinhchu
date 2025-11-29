/**
 * LOCAL AI CHATBOT - MESSENGER STYLE
 * Tự động tạo giao diện và thu thập dữ liệu từ website
 */

(function() {
    // 1. CHÈN CSS VÀO TRANG (Giao diện Messenger)
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --ms-blue: #0084FF; --ms-grey: #F0F2F5; --ms-chat-bg: #FFFFFF; }
        .dark { --ms-grey: #3A3B3C; --ms-chat-bg: #242526; }
        
        /* Animation */
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .typing-dot { animation: typing 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        
        /* UI Classes */
        #ai-chatbot-root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 10px; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); }
        .hidden-chat { transform: scale(0.9); opacity: 0; pointer-events: none; }
        .visible-chat { transform: scale(1); opacity: 1; pointer-events: auto; }
    `;
    document.head.appendChild(style);

    // 2. CHÈN HTML VÀO TRANG (Nút & Cửa sổ chat)
    const htmlStructure = `
    <div id="ai-chatbot-root">
        <div class="fixed bottom-6 left-6 z-50 flex flex-col gap-2 items-start">
            <div id="chat-greeting" class="bg-white dark:bg-[#242526] p-3 rounded-2xl rounded-bl-none shadow-lg mb-1 animate-bounce origin-bottom-left max-w-[200px] border border-gray-100 dark:border-gray-700 relative">
                <p class="text-xs font-bold text-gray-700 dark:text-gray-200">👋 Chào bạn! Tôi là AI tư vấn. Hỏi tôi bất cứ gì nhé!</p>
                <button onclick="this.parentElement.remove()" class="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-600">✕</button>
            </div>
            <button onclick="window.toggleChatbot()" class="w-16 h-16 rounded-full bg-gradient-to-br from-[#0084FF] to-[#0066CC] shadow-2xl flex items-center justify-center text-white transition hover:scale-110 active:scale-95 group relative overflow-hidden">
                <i class="ph-fill ph-messenger-logo text-3xl z-10"></i>
                <span class="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></span>
            </button>
        </div>

        <div id="ai-chatbot-window" class="fixed bottom-24 left-6 w-[90vw] md:w-[380px] h-[550px] max-h-[70vh] bg-white dark:bg-[#242526] rounded-t-2xl rounded-br-2xl shadow-2xl z-50 flex flex-col hidden-chat transform origin-bottom-left transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="bg-white dark:bg-[#242526] p-4 flex items-center justify-between shadow-sm z-10 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0084FF] to-cyan-400 p-0.5">
                            <img src="https://i.postimg.cc/T2cW9Yk6/IMG-5191.png" class="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#242526]">
                        </div>
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full"></div>
                    </div>
                    <div>
                        <h3 class="font-bold text-[15px] text-gray-900 dark:text-white leading-tight">Trợ Lý Nhà Đất LB</h3>
                        <span class="text-[11px] text-blue-500 font-medium">Đang hoạt động • AI Local</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.resetChat()" class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition"><i class="ph-bold ph-trash"></i></button>
                    <button onclick="window.toggleChatbot()" class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-[#0084FF] transition"><i class="ph-bold ph-caret-down"></i></button>
                </div>
            </div>

            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#242526] chat-scroll">
                <div class="flex items-end gap-2 group">
                    <div class="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"><img src="https://i.postimg.cc/T2cW9Yk6/IMG-5191.png" class="w-full h-full object-cover"></div>
                    <div class="max-w-[80%] bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] px-4 py-2.5 rounded-2xl rounded-bl-none text-[14px] leading-relaxed shadow-sm">
                        Chào bạn! Tôi đã đọc hết thông tin trên trang web này. Bạn cần tìm nhà khu vực nào, giá khoảng bao nhiêu?
                    </div>
                </div>
                <div class="pl-9 flex flex-wrap gap-2">
                    <button onclick="window.sendMessage('Giá nhà Long Biên thế nào?')" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#0084FF] text-xs font-bold rounded-full hover:bg-blue-100 transition">💰 Giá nhà</button>
                    <button onclick="window.sendMessage('Có nhà ô tô vào không?')" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#0084FF] text-xs font-bold rounded-full hover:bg-blue-100 transition">🚗 Nhà ô tô vào</button>
                    <button onclick="window.sendMessage('Thủ tục mua bán?')" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#0084FF] text-xs font-bold rounded-full hover:bg-blue-100 transition">📝 Thủ tục</button>
                </div>
            </div>

            <div class="p-3 bg-white dark:bg-[#242526] border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <input type="text" id="chat-input" placeholder="Nhập câu hỏi..." class="flex-1 bg-[#F0F2F5] dark:bg-[#3A3B3C] text-gray-900 dark:text-white px-4 py-2.5 rounded-full text-[14px] outline-none border border-transparent focus:border-blue-500 transition">
                <button onclick="window.handleUserMessage()" class="w-10 h-10 rounded-full bg-[#0084FF] text-white flex items-center justify-center hover:bg-blue-600 transition shadow-md active:scale-95"><i class="ph-fill ph-paper-plane-right text-lg"></i></button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', htmlStructure);

    // 3. LOGIC XỬ LÝ (Crawler & Chat)
    let siteKnowledge = [];
    const chatWindow = document.getElementById('ai-chatbot-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    let isChatOpen = false;

    // Crawler: Quét dữ liệu web
    function crawlSiteData() {
        const contentNodes = document.querySelectorAll('main h1, main h2, main h3, main p, main li, #vip-listing p, #faq summary, #faq div');
        contentNodes.forEach(node => {
            const text = node.innerText.trim();
            if (text.length > 20) {
                siteKnowledge.push({ text: text, keywords: text.toLowerCase().split(/\s+/), score: 0 });
            }
        });
        console.log("AI Chatbot: Đã học " + siteKnowledge.length + " mục dữ liệu.");
    }
    setTimeout(crawlSiteData, 1000); // Đợi web load xong mới quét

    // Tìm câu trả lời
    function findBestAnswer(query) {
        const queryKeywords = query.toLowerCase().split(/\s+/);
        let bestMatch = null;
        let maxScore = 0;
        siteKnowledge.forEach(item => item.score = 0);
        
        siteKnowledge.forEach(item => {
            queryKeywords.forEach(qWord => { if (item.keywords.includes(qWord)) item.score += 1; });
            if (item.text.toLowerCase().includes(query.toLowerCase())) item.score += 3;
            if (item.score > maxScore) { maxScore = item.score; bestMatch = item.text; }
        });

        if (maxScore > 0) return bestMatch;
        // Fallback answers
        if (query.includes("chào") || query.includes("hi")) return "Chào bạn! Tôi có thể giúp gì cho việc mua bán nhà đất của bạn?";
        if (query.includes("liên hệ") || query.includes("sđt") || query.includes("số")) return "Bạn hãy gọi ngay hotline: 0845 622 012 để được hỗ trợ nhanh nhất nhé!";
        if (query.includes("địa chỉ")) return "Văn phòng chúng tôi tại 112 Nguyễn Văn Cừ, Bồ Đề, Long Biên.";
        return "Xin lỗi, tôi chưa tìm thấy thông tin này trên trang. Bạn vui lòng gọi 0845 622 012 để hỏi trực tiếp nhé!";
    }

    // Các hàm Global để gọi từ HTML
    window.toggleChatbot = function() {
        isChatOpen = !isChatOpen;
        const greeting = document.getElementById('chat-greeting');
        if(greeting) greeting.remove();
        
        if (isChatOpen) {
            chatWindow.classList.remove('hidden-chat');
            chatWindow.classList.add('visible-chat');
            setTimeout(() => chatInput.focus(), 100);
        } else {
            chatWindow.classList.remove('visible-chat');
            chatWindow.classList.add('hidden-chat');
        }
    }

    window.handleUserMessage = function() {
        const text = chatInput.value.trim();
        if (!text) return;
        window.sendMessage(text);
        chatInput.value = '';
    }

    window.sendMessage = function(text) {
        addMessageUI(text, 'user');
        showTyping();
        setTimeout(() => {
            removeTyping();
            const answer = findBestAnswer(text);
            addMessageUI(answer, 'bot');
        }, 1200);
    }

    window.resetChat = function() {
        chatMessages.innerHTML = `<div class="flex items-end gap-2 group"><div class="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"><img src="https://i.postimg.cc/T2cW9Yk6/IMG-5191.png" class="w-full h-full object-cover"></div><div class="max-w-[80%] bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] px-4 py-2.5 rounded-2xl rounded-bl-none text-[14px] leading-relaxed shadow-sm">Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ gì?</div></div>`;
    }

    // Xử lý phím Enter
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') window.handleUserMessage();
    });

    // Helper UI
    function addMessageUI(text, sender) {
        const div = document.createElement('div');
        div.className = sender === 'user' ? 'flex items-end justify-end gap-2' : 'flex items-end gap-2 group';
        const bgClass = sender === 'user' ? 'bg-[#0084FF] text-white rounded-br-none' : 'bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] rounded-bl-none';
        const avatar = sender === 'bot' ? `<div class="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"><img src="https://i.postimg.cc/T2cW9Yk6/IMG-5191.png" class="w-full h-full object-cover"></div>` : '';
        
        div.innerHTML = `${avatar}<div class="max-w-[80%] ${bgClass} px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm animate-[popIn_0.3s_ease-out]">${text}</div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = 'flex items-end gap-2 group';
        div.innerHTML = `<div class="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"><img src="https://i.postimg.cc/T2cW9Yk6/IMG-5191.png" class="w-full h-full object-cover"></div><div class="bg-[#F0F2F5] dark:bg-[#3A3B3C] px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center shadow-sm"><div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div><div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div><div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div></div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

})();
