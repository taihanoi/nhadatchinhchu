/* RealEstateAI_v6_MobileSheet.js
   ✅ Giao diện: Desktop (Góc trái) | Mobile (Dạng Sheet 70% chiều cao).
   ✅ UI/UX: Thêm Backdrop tối màu để tập trung.
   ✅ Logic: Giữ nguyên bộ não V5 (Tính tiền + Học sâu).
*/

(function() {
    // === 1. CẤU HÌNH HỆ THỐNG ===
    const CONFIG = {
        name: "Trợ Lý Nhà Đất LB",
        phone: "0845622012",
        zalo: "https://zalo.me/0845622012",
        avatar: "https://i.postimg.cc/T2cW9Yk6/IMG-5191.png",
        color: "#0084FF",
        
        // Cấu hình học (Deep Crawl)
        selectors: [
            { tag: "#vip-listing h2", score: 5 }, 
            { tag: "#vip-listing li", score: 3 }, 
            { tag: "#banggia h3", score: 4 },     
            { tag: ".prose h2", score: 4 },       
            { tag: ".prose p", score: 1 },        
            { tag: "#faq summary", score: 4 },    
            { tag: "#faq div", score: 1 }         
        ],
        
        priceAlley: { min: 80, max: 150 },    // Trong ngõ
        priceStreet: { min: 300, max: 500 }   // Mặt đường
    };

    // === 2. AI BRAIN (Logic V5 - Giữ nguyên sự thông minh) ===
    const Brain = {
        knowledge: [],
        learn: function() {
            Brain.knowledge = [];
            CONFIG.selectors.forEach(sel => {
                document.querySelectorAll(sel.tag).forEach(el => {
                    const text = el.innerText.replace(/\s+/g, ' ').trim();
                    if (text.length > 20) {
                        Brain.knowledge.push({
                            text: text,
                            keywords: text.toLowerCase().split(/\s+/),
                            weight: sel.score,
                            price: Brain.extractPrice(text)
                        });
                    }
                });
            });
            console.log(`🧠 AI V6 đã học ${Brain.knowledge.length} đoạn dữ liệu.`);
        },
        extractPrice: function(text) {
            const m = text.match(/(\d+[,.]?\d*)\s*(tỷ|ty)/i);
            return m ? parseFloat(m[1].replace(',', '.')) : null;
        },
        extractArea: function(text) {
            const m = text.match(/(\d+)\s*(m2|m|mét)/i);
            return m ? parseInt(m[1]) : null;
        },
        calculate: function(query, area) {
            let min = CONFIG.priceAlley.min, max = CONFIG.priceAlley.max, type = "Trong ngõ";
            if (/(mặt\s*đường|mặt\s*phố|kinh\s*doanh|ô\s*tô)/i.test(query)) {
                min = CONFIG.priceStreet.min; max = CONFIG.priceStreet.max; type = "Mặt phố";
            }
            const tMin = (area * min) / 1000;
            const tMax = (area * max) / 1000;
            return `📊 ĐỊNH GIÁ (${type}):\nDiện tích: ${area}m2\nĐơn giá: ${min}-${max} tr/m2\n👉 Tài chính: ${tMin.toFixed(1)} - ${tMax.toFixed(1)} Tỷ\n(Giá tham khảo thị trường).`;
        },
        search: function(query) {
            const qWords = query.toLowerCase().split(/\s+/);
            const qPrice = Brain.extractPrice(query);
            let best = null, maxScore = 0;

            Brain.knowledge.forEach(item => {
                let score = 0;
                qWords.forEach(w => { if (item.keywords.includes(w)) score += 1; });
                if (item.text.toLowerCase().includes(query.toLowerCase())) score += 5;
                if (qPrice && item.price && Math.abs(qPrice - item.price) <= 0.5) score += 10;
                score = score * item.weight;
                if (score > maxScore) { maxScore = score; best = item; }
            });
            return (maxScore >= 4) ? best.text : null;
        },
        process: function(query) {
            const q = query.toLowerCase();
            const area = Brain.extractArea(q);
            if (area && area > 10 && area < 1000) return { text: Brain.calculate(q, area), type: 'calc' };
            if (/^(hi|helo|chào|alo)/i.test(q) && q.length < 20) return { text: "Chào bạn! Mình là AI Long Biên. Bạn cần tìm nhà khu vực nào (Bồ Đề, Ngọc Lâm...) hay cần tính giá nhà?", type: 'chat' };
            if (/(liên hệ|sđt|hotline|zalo)/i.test(q)) return { text: `Hotline chính chủ: ${CONFIG.phone} (Zalo). Mình hỗ trợ 24/7 nhé!`, type: 'contact' };
            const webResult = Brain.search(query);
            if (webResult) return { text: `Theo thông tin trên web:\n"${webResult}"`, type: 'result' };
            return { text: `Mình chưa tìm thấy tin chính xác cho "${query}". Bạn thử nhập diện tích (VD: 50m2) để mình định giá nhé!`, type: 'fallback' };
        }
    };

    // === 3. GIAO DIỆN (UI V6 - Mobile Sheet 70%) ===
    const UI = {
        init: function() {
            const css = `
                /* Nút mở chat */
                #ai-toggle { 
                    position: fixed; bottom: max(20px, env(safe-area-inset-bottom) + 20px); left: 20px; 
                    width: 60px; height: 60px; background: ${CONFIG.color}; 
                    border-radius: 50%; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
                    z-index: 9990; cursor: pointer; display: flex; align-items: center; justify-content: center; 
                    transition: transform 0.2s; 
                }
                #ai-toggle:active { transform: scale(0.9); }
                #ai-toggle svg { width: 30px; height: 30px; fill: white; }

                /* Lớp phủ tối (Backdrop) */
                #ai-backdrop {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998;
                    display: none; opacity: 0; transition: opacity 0.3s;
                }

                /* Khung Chat */
                #ai-box { 
                    position: fixed; z-index: 9999; background: #fff; 
                    display: none; flex-direction: column; overflow: hidden; 
                    font-family: system-ui, -apple-system, sans-serif;
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                }

                /* Desktop: Giữ nguyên ô nhỏ góc trái */
                @media (min-width: 481px) { 
                    #ai-box { 
                        width: 360px; height: 550px; bottom: 90px; left: 20px; 
                        border-radius: 16px; border: 1px solid #eee; 
                    } 
                }

                /* Mobile: Dạng Sheet 70% */
                @media (max-width: 480px) { 
                    #ai-box { 
                        width: 100%; 
                        height: 70dvh; /* Chiếm 70% chiều cao màn hình */
                        bottom: 0; left: 0; right: 0; 
                        border-radius: 24px 24px 0 0; /* Bo tròn 2 góc trên */
                        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    } 
                }

                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

                /* Các thành phần bên trong */
                #ai-header { 
                    padding: 15px; background: ${CONFIG.color}; color: white; 
                    display: flex; align-items: center; gap: 10px; flex-shrink: 0; 
                    /* Mobile: Header không cần padding-top Safe Area vì nằm giữa màn hình */
                }
                #ai-header img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #fff; }
                #ai-close { margin-left: auto; background: none; border: none; color: white; font-size: 24px; padding: 5px; cursor: pointer; }
                
                #ai-body { 
                    flex: 1; overflow-y: auto; padding: 15px; background: #f0f2f5; 
                    display: flex; flex-direction: column; gap: 10px; 
                    overscroll-behavior: contain; 
                }
                .ai-msg { max-width: 85%; padding: 10px 14px; border-radius: 18px; font-size: 15px; line-height: 1.4; white-space: pre-wrap; }
                .ai-bot { background: white; align-self: flex-start; color: #1c1e21; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border-bottom-left-radius: 4px; }
                .ai-user { background: ${CONFIG.color}; align-self: flex-end; color: white; border-bottom-right-radius: 4px; }
                
                #ai-footer { 
                    background: white; border-top: 1px solid #eee; padding: 10px; 
                    /* Safe Area cho iPhone khi vuốt từ dưới lên */
                    padding-bottom: max(10px, env(safe-area-inset-bottom)); 
                    flex-shrink: 0; 
                }
                #ai-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
                .ai-chip { background: #e4e6eb; padding: 8px 14px; border-radius: 20px; font-size: 13px; white-space: nowrap; font-weight: 500; color: #050505; cursor: pointer; }
                
                #ai-input-wrap { display: flex; gap: 10px; align-items: center; }
                #ai-input { 
                    flex: 1; padding: 12px; border-radius: 24px; border: 1px solid #ddd; 
                    outline: none; font-size: 16px; /* Chống zoom trên iOS */ 
                    background: #f0f2f5; 
                }
                #ai-input:focus { background: white; border-color: ${CONFIG.color}; }
                #ai-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: ${CONFIG.color}; color: white; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            `;
            const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s);

            const html = `
                <div id="ai-root">
                    <div id="ai-backdrop"></div>
                    <button id="ai-toggle"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg></button>
                    <div id="ai-box">
                        <div id="ai-header">
                            <img src="${CONFIG.avatar}">
                            <div><div style="font-weight:700">${CONFIG.name}</div><div style="font-size:11px;opacity:0.9">● Trực tuyến</div></div>
                            <button id="ai-close">×</button>
                        </div>
                        <div id="ai-body">
                            <div class="ai-msg ai-bot">Chào bạn! Nhập diện tích (VD: 50m2) để tính giá, hoặc hỏi bất kỳ thông tin gì về nhà đất nhé! 🏠</div>
                        </div>
                        <div id="ai-footer">
                            <div id="ai-chips">
                                <div class="ai-chip">🏠 Ngõ 30m2</div>
                                <div class="ai-chip">🏠 Ngõ 50m2</div>
                                <div class="ai-chip">🏪 Mặt phố 60m2</div>
                                <div class="ai-chip">📝 Thủ tục</div>
                            </div>
                            <div id="ai-input-wrap">
                                <input id="ai-input" type="text" placeholder="Nhập câu hỏi..." autocomplete="off">
                                <button id="ai-send">➤</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);

            const box = document.getElementById('ai-box');
            const backdrop = document.getElementById('ai-backdrop');
            const toggle = document.getElementById('ai-toggle');
            const inp = document.getElementById('ai-input');
            const body = document.getElementById('ai-body');

            // Toggle Events
            const openChat = () => {
                box.style.display = 'flex';
                backdrop.style.display = 'block';
                setTimeout(() => backdrop.style.opacity = '1', 10); // Fade in backdrop
                toggle.style.opacity = '0'; toggle.style.pointerEvents = 'none';
                if(window.innerWidth > 480) inp.focus();
                document.body.style.overflow = 'hidden';
            };

            const closeChat = () => {
                box.style.display = 'none';
                backdrop.style.opacity = '0';
                setTimeout(() => backdrop.style.display = 'none', 300);
                toggle.style.opacity = '1'; toggle.style.pointerEvents = 'auto';
                document.body.style.overflow = '';
            };

            toggle.onclick = openChat;
            document.getElementById('ai-close').onclick = closeChat;
            backdrop.onclick = closeChat; // Bấm ra ngoài là đóng

            // Chat Logic
            const scroll = () => body.scrollTop = body.scrollHeight;
            const addMsg = (txt, type) => { const d = document.createElement('div'); d.className = `ai-msg ai-${type}`; d.innerText = txt; body.appendChild(d); scroll(); };

            const handleSend = async () => {
                const txt = inp.value.trim(); if(!txt) return;
                addMsg(txt, 'user'); inp.value = '';
                
                const typing = document.createElement('div'); typing.className = 'ai-msg ai-bot ai-typing'; typing.innerText = 'Đang xử lý...'; body.appendChild(typing); scroll();
                
                setTimeout(() => {
                    typing.remove();
                    const res = Brain.process(txt);
                    addMsg(res.text, 'bot');
                }, 800);
            };

            document.getElementById('ai-send').onclick = handleSend;
            inp.onkeypress = (e) => { if(e.key==='Enter') handleSend(); };
            
            document.querySelectorAll('.ai-chip').forEach(c => {
                c.onclick = () => { 
                    let t = c.innerText;
                    if(t.includes("Ngõ")) t = "Nhà trong ngõ " + t.match(/\d+m2/)[0];
                    if(t.includes("Mặt phố")) t = "Mặt phố " + t.match(/\d+m2/)[0];
                    inp.value = t; handleSend();
                };
            });
        }
    };

    // === 4. RUN ===
    window.addEventListener('DOMContentLoaded', () => { setTimeout(() => { Brain.learn(); UI.init(); }, 1000); });
})();
