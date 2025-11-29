/* RealEstateAI_v5_Ultimate.js
   ✅ Giao diện: Fix cứng Mobile (Góc trái, Full màn hình khi mở).
   ✅ Logic Tính Toán: Tự nhân giá theo m2 (Ngõ/Phố).
   ✅ Logic Crawler: KHÔI PHỤC khả năng học sâu (Scoring System) như bản V38.
   ✅ Search Engine: Tìm kiếm theo điểm số (Weighted Keywords).
*/

(function() {
    // === 1. CẤU HÌNH HỆ THỐNG ===
    const CONFIG = {
        name: "Trợ Lý Nhà Đất LB",
        phone: "0845622012",
        zalo: "https://zalo.me/0845622012",
        avatar: "https://i.postimg.cc/T2cW9Yk6/IMG-5191.png",
        color: "#0084FF",
        
        // Các khu vực nội dung quan trọng cần học
        // Ưu tiên thẻ H1, H2, H3 (Tiêu đề) cao hơn thẻ P (Văn bản)
        selectors: [
            { tag: "#vip-listing h2", score: 5 }, // Tiêu đề tin VIP
            { tag: "#vip-listing li", score: 3 }, // Đặc điểm tin VIP
            { tag: "#banggia h3", score: 4 },     // Tiêu đề bảng giá
            { tag: ".prose h2", score: 4 },       // Tiêu đề bài viết
            { tag: ".prose p", score: 1 },        // Nội dung bài viết
            { tag: "#faq summary", score: 4 },    // Câu hỏi FAQ
            { tag: "#faq div", score: 1 }         // Trả lời FAQ
        ],
        
        // Đơn giá thị trường (Triệu/m2) để bot tự tính
        priceAlley: { min: 80, max: 150 },    // Trong ngõ
        priceStreet: { min: 300, max: 500 }   // Mặt đường
    };

    // === 2. AI BRAIN (Bộ não xử lý) ===
    const Brain = {
        knowledge: [], // Kho dữ liệu đã học

        // Hàm học dữ liệu (Crawler xịn)
        learn: function() {
            Brain.knowledge = [];
            CONFIG.selectors.forEach(sel => {
                document.querySelectorAll(sel.tag).forEach(el => {
                    const text = el.innerText.replace(/\s+/g, ' ').trim();
                    if (text.length > 20) { // Chỉ học câu có ý nghĩa
                        Brain.knowledge.push({
                            text: text,
                            keywords: text.toLowerCase().split(/\s+/), // Tách từ khóa
                            weight: sel.score, // Trọng số quan trọng
                            price: Brain.extractPrice(text) // Lưu kèm giá nếu có
                        });
                    }
                });
            });
            console.log(`🧠 AI V5 đã học ${Brain.knowledge.length} đoạn dữ liệu sâu.`);
        },

        // Trích xuất số tiền (VD: 3.5 tỷ)
        extractPrice: function(text) {
            const m = text.match(/(\d+[,.]?\d*)\s*(tỷ|ty)/i);
            return m ? parseFloat(m[1].replace(',', '.')) : null;
        },

        // Trích xuất diện tích (VD: 50m2)
        extractArea: function(text) {
            const m = text.match(/(\d+)\s*(m2|m|mét)/i);
            return m ? parseInt(m[1]) : null;
        },

        // Logic tính tiền (Calculator)
        calculate: function(query, area) {
            let min = CONFIG.priceAlley.min, max = CONFIG.priceAlley.max, type = "Trong ngõ";
            if (/(mặt\s*đường|mặt\s*phố|kinh\s*doanh|ô\s*tô)/i.test(query)) {
                min = CONFIG.priceStreet.min; max = CONFIG.priceStreet.max; type = "Mặt phố";
            }
            const tMin = (area * min) / 1000;
            const tMax = (area * max) / 1000;
            return `📊 ĐỊNH GIÁ (${type}):\nDiện tích: ${area}m2\nĐơn giá: ${min}-${max} tr/m2\n👉 Tài chính: ${tMin.toFixed(1)} - ${tMax.toFixed(1)} Tỷ\n(Giá tham khảo thị trường).`;
        },

        // Tìm kiếm thông minh (Scoring System)
        search: function(query) {
            const qWords = query.toLowerCase().split(/\s+/);
            const qPrice = Brain.extractPrice(query);
            let best = null;
            let maxScore = 0;

            Brain.knowledge.forEach(item => {
                let score = 0;
                // 1. Chấm điểm từ khóa khớp
                qWords.forEach(w => {
                    if (item.keywords.includes(w)) score += 1;
                });
                
                // 2. Chấm điểm cụm từ (Khớp cả câu)
                if (item.text.toLowerCase().includes(query.toLowerCase())) score += 5;

                // 3. Chấm điểm theo giá tiền (Nếu khách hỏi "Nhà 5 tỷ")
                if (qPrice && item.price) {
                    if (Math.abs(qPrice - item.price) <= 0.5) score += 10; // Khớp giá cộng điểm cực cao
                }

                // 4. Nhân với trọng số thẻ (H1, H2 quan trọng hơn P)
                score = score * item.weight;

                if (score > maxScore) {
                    maxScore = score;
                    best = item;
                }
            });

            // Ngưỡng điểm để quyết định trả lời hay không
            return (maxScore >= 4) ? best.text : null;
        },

        // Bộ định tuyến trả lời
        process: function(query) {
            const q = query.toLowerCase();
            
            // 1. Ưu tiên Tính tiền
            const area = Brain.extractArea(q);
            if (area && area > 10 && area < 1000) return { text: Brain.calculate(q, area), type: 'calc' };

            // 2. Xã giao
            if (/^(hi|helo|chào|alo)/i.test(q) && q.length < 20) return { text: "Chào bạn! Mình là AI Long Biên. Bạn cần tìm nhà khu vực nào (Bồ Đề, Ngọc Lâm...) hay cần tính giá nhà?", type: 'chat' };

            // 3. Liên hệ
            if (/(liên hệ|sđt|hotline|zalo)/i.test(q)) return { text: `Hotline chính chủ: ${CONFIG.phone} (Zalo). Mình hỗ trợ 24/7 nhé!`, type: 'contact' };

            // 4. Tìm kiếm trong dữ liệu web (Deep Search)
            const webResult = Brain.search(query);
            if (webResult) return { text: `Theo thông tin trên web:\n"${webResult}"`, type: 'result' };

            // 5. Fallback
            return { text: `Mình chưa tìm thấy tin chính xác cho "${query}". Bạn thử nhập diện tích (VD: 50m2) để mình định giá, hoặc gọi ${CONFIG.phone} để check nguồn hàng kín nhé!`, type: 'fallback' };
        }
    };

    // === 3. GIAO DIỆN (UI MESSENGER - MOBILE FIXED) ===
    const UI = {
        init: function() {
            const css = `
                #ai-toggle { position: fixed; bottom: max(20px, env(safe-area-inset-bottom) + 20px); left: 20px; width: 60px; height: 60px; background: ${CONFIG.color}; border-radius: 50%; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9990; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
                #ai-toggle:active { transform: scale(0.9); }
                #ai-toggle svg { width: 30px; height: 30px; fill: white; }
                #ai-box { position: fixed; z-index: 9999; background: #fff; display: none; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.2); overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
                @media (min-width: 481px) { #ai-box { width: 360px; height: 550px; bottom: 90px; left: 20px; border-radius: 16px; border: 1px solid #eee; } }
                @media (max-width: 480px) { #ai-box { width: 100%; height: 100dvh; top: 0; left: 0; bottom: 0; right: 0; border-radius: 0; } }
                #ai-header { padding: 15px; background: ${CONFIG.color}; color: white; display: flex; align-items: center; gap: 10px; flex-shrink: 0; padding-top: max(15px, env(safe-area-inset-top)); }
                #ai-header img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #fff; }
                #ai-close { margin-left: auto; background: none; border: none; color: white; font-size: 24px; padding: 5px; }
                #ai-body { flex: 1; overflow-y: auto; padding: 15px; background: #f0f2f5; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
                .ai-msg { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 15px; line-height: 1.4; white-space: pre-wrap; }
                .ai-bot { background: white; align-self: flex-start; color: #1c1e21; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border-bottom-left-radius: 4px; }
                .ai-user { background: ${CONFIG.color}; align-self: flex-end; color: white; border-bottom-right-radius: 4px; }
                #ai-footer { background: white; border-top: 1px solid #eee; padding: 10px; padding-bottom: max(10px, env(safe-area-inset-bottom)); flex-shrink: 0; }
                #ai-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
                .ai-chip { background: #e4e6eb; padding: 8px 14px; border-radius: 20px; font-size: 13px; white-space: nowrap; font-weight: 500; color: #050505; cursor: pointer; }
                #ai-input-wrap { display: flex; gap: 10px; align-items: center; }
                #ai-input { flex: 1; padding: 12px; border-radius: 24px; border: 1px solid #ddd; outline: none; font-size: 16px; background: #f0f2f5; }
                #ai-input:focus { background: white; border-color: ${CONFIG.color}; }
                #ai-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: ${CONFIG.color}; color: white; font-size: 18px; display: flex; align-items: center; justify-content: center; }
            `;
            const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s);

            const html = `
                <div id="ai-root">
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
            const toggle = document.getElementById('ai-toggle');
            const inp = document.getElementById('ai-input');
            const body = document.getElementById('ai-body');

            // Toggle Events
            toggle.onclick = () => { box.style.display = 'flex'; toggle.style.opacity = '0'; toggle.style.pointerEvents = 'none'; if(window.innerWidth > 480) inp.focus(); document.body.style.overflow = 'hidden'; };
            document.getElementById('ai-close').onclick = () => { box.style.display = 'none'; toggle.style.opacity = '1'; toggle.style.pointerEvents = 'auto'; document.body.style.overflow = ''; };

            // Scroll Helper
            const scroll = () => body.scrollTop = body.scrollHeight;
            const addMsg = (txt, type) => { const d = document.createElement('div'); d.className = `ai-msg ai-${type}`; d.innerText = txt; body.appendChild(d); scroll(); };

            // Send Logic
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
            
            // Chips Logic
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

    // === 4. KHỞI CHẠY ===
    window.addEventListener('DOMContentLoaded', () => { setTimeout(() => { Brain.learn(); UI.init(); }, 1000); });
})();
