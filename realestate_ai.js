/* RealEstateAI_v4_SmartCalc.js
   ✅ Giao diện: GIỮ NGUYÊN (Góc trái, Full mobile).
   ✅ Logic Mới: Tự động tính tiền theo m2 (Ngõ: 80-150tr, Phố: 300-500tr).
   ✅ AI: Kết hợp vừa tính toán + vừa tra cứu dữ liệu web.
*/

(function() {
    // === 1. CẤU HÌNH ===
    const CONFIG = {
        name: "Trợ Lý Nhà Đất LB",
        phone: "0845622012",
        zalo: "https://zalo.me/0845622012",
        avatar: "https://i.postimg.cc/T2cW9Yk6/IMG-5191.png",
        color: "#0084FF",
        // Nguồn dữ liệu để học
        learnSources: ["#vip-listing h2", "#vip-listing p", "#vip-listing li", "#banggia h3", "#banggia span", "#khuvuc h3", "#khuvuc p", "#faq summary", "#faq div", ".prose p"],
        // Đơn giá thị trường (Triệu/m2)
        priceAlley: { min: 80, max: 150 }, // Trong ngõ
        priceStreet: { min: 300, max: 500 } // Mặt đường
    };

    // === 2. AI BRAIN (Logic Tính Toán + Tìm kiếm) ===
    const Brain = {
        data: [],
        
        // Học dữ liệu từ web
        learn: function() {
            Brain.data = [];
            document.querySelectorAll(CONFIG.learnSources.join(",")).forEach(el => {
                const text = el.innerText.replace(/\s+/g, ' ').trim();
                if (text.length > 15) {
                    Brain.data.push({ text: text });
                }
            });
            console.log(`🧠 AI đã học ${Brain.data.length} dữ liệu.`);
        },

        // Trích xuất diện tích (VD: 50m2, 50m, 50 mét)
        extractArea: function(text) {
            const m = text.match(/(\d+)\s*(m2|m|mét|vuông)/i);
            return m ? parseInt(m[1]) : null;
        },

        // Logic tính tiền tự động
        calculatePrice: function(query, area) {
            let min = 0, max = 0, type = "";

            // Phân loại Ngõ hay Mặt đường
            if (/(mặt\s*đường|mặt\s*phố|kinh\s*doanh|ô\s*tô|oto)/i.test(query)) {
                min = CONFIG.priceStreet.min;
                max = CONFIG.priceStreet.max;
                type = "Mặt đường/Kinh doanh";
            } else if (/(ngõ|ngách|hẻm)/i.test(query)) {
                min = CONFIG.priceAlley.min;
                max = CONFIG.priceAlley.max;
                type = "Trong ngõ";
            } else {
                // Mặc định nếu không nói rõ thì lấy giá ngõ (phổ biến hơn)
                min = CONFIG.priceAlley.min; 
                max = CONFIG.priceAlley.max;
                type = "Trong ngõ (Dự kiến)";
            }

            // Tính toán ra Tỷ
            const totalMin = (area * min) / 1000;
            const totalMax = (area * max) / 1000;

            return `📊 ĐỊNH GIÁ NHANH (${type}):\n` +
                   `• Diện tích: ${area}m2\n` +
                   `• Đơn giá: ${min}-${max} tr/m2\n` +
                   `👉 Tài chính khoảng: ${totalMin.toFixed(1)} Tỷ - ${totalMax.toFixed(1)} Tỷ.\n` + 
                   `(Đây là giá thị trường tham khảo, thực tế tùy vị trí và nội thất).`;
        },

        // Tìm câu trả lời
        findAnswer: function(query) {
            const q = query.toLowerCase();

            // 1. Kiểm tra xem user có hỏi Tính tiền không (Có số m2)
            const area = Brain.extractArea(q);
            if (area && area > 10 && area < 1000) {
                return { type: 'calc', text: Brain.calculatePrice(q, area) };
            }

            // 2. Chào hỏi
            if (/^(hi|helo|chào|alo)/i.test(q) && q.length < 15) return { type: 'chat', text: "Chào bạn! Bạn cần tìm nhà trong ngõ hay mặt phố? Nhập diện tích (VD: 50m2) mình tính giá nhanh cho nhé!" };
            
            // 3. Liên hệ
            if (/(liên hệ|sđt|hotline|zalo)/i.test(q)) return { type: 'contact', text: `Hotline: ${CONFIG.phone} (Zalo). Mình hỗ trợ 24/7 nhé!` };
            
            // 4. Tìm kiếm dữ liệu trên web (Fallback)
            let best = null, max = 0;
            Brain.data.forEach(item => {
                let score = 0;
                q.split(" ").forEach(w => { if (item.text.toLowerCase().includes(w)) score++; });
                if (score > max) { max = score; best = item; }
            });
            
            return (max >= 2 && best) ? { type: 'result', text: best.text } : { type: 'fallback', text: null };
        }
    };

    // === 3. UI MESSENGER (Giữ nguyên V3 - Mobile Fixed) ===
    const UI = {
        init: function() {
            const style = document.createElement('style');
            style.innerHTML = `
                #ai-toggle { 
                    position: fixed; bottom: max(20px, env(safe-area-inset-bottom) + 20px); left: 20px; 
                    width: 60px; height: 60px; background: ${CONFIG.color}; border-radius: 50%; border: none; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9990; cursor: pointer; 
                    display: flex; align-items: center; justify-content: center; transition: transform 0.2s;
                }
                #ai-toggle:active { transform: scale(0.9); }
                #ai-toggle svg { width: 30px; height: 30px; fill: white; }
                #ai-box { 
                    position: fixed; z-index: 9999; background: #fff; display: none; flex-direction: column; 
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2); overflow: hidden; font-family: -apple-system, sans-serif;
                }
                @media (min-width: 481px) {
                    #ai-box { width: 360px; height: 550px; bottom: 90px; left: 20px; border-radius: 16px; border: 1px solid #eee; }
                }
                @media (max-width: 480px) {
                    #ai-box { width: 100%; height: 100%; height: 100dvh; top: 0; left: 0; bottom: 0; right: 0; border-radius: 0; }
                }
                #ai-header { padding: 15px; background: ${CONFIG.color}; color: white; display: flex; align-items: center; gap: 10px; flex-shrink: 0; padding-top: max(15px, env(safe-area-inset-top)); }
                #ai-header img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); }
                #ai-close { margin-left: auto; background: none; border: none; color: white; font-size: 24px; padding: 5px; }
                #ai-body { flex: 1; overflow-y: auto; padding: 15px; background: #f0f2f5; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
                .ai-msg { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 15px; line-height: 1.4; white-space: pre-wrap; }
                .ai-bot { background: white; align-self: flex-start; color: #1c1e21; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border-bottom-left-radius: 4px; }
                .ai-user { background: ${CONFIG.color}; align-self: flex-end; color: white; border-bottom-right-radius: 4px; }
                #ai-footer { background: white; border-top: 1px solid #eee; padding: 10px; padding-bottom: max(10px, env(safe-area-inset-bottom)); flex-shrink: 0; }
                #ai-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
                .ai-chip { background: #e4e6eb; padding: 8px 14px; border-radius: 20px; font-size: 13px; white-space: nowrap; font-weight: 500; color: #050505; }
                #ai-input-wrap { display: flex; gap: 10px; align-items: center; }
                #ai-input { flex: 1; padding: 12px; border-radius: 24px; border: 1px solid #ddd; outline: none; font-size: 16px; background: #f0f2f5; }
                #ai-input:focus { background: white; border-color: ${CONFIG.color}; }
                #ai-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: ${CONFIG.color}; color: white; font-size: 18px; display: flex; align-items: center; justify-content: center; }
            `;
            document.head.appendChild(style);

            const html = `
                <div id="ai-root">
                    <button id="ai-toggle"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg></button>
                    <div id="ai-box">
                        <div id="ai-header">
                            <img src="${CONFIG.avatar}">
                            <div><div style="font-weight:700">${CONFIG.name}</div><div style="font-size:11px;opacity:0.9">● Sẵn sàng tính giá</div></div>
                            <button id="ai-close">×</button>
                        </div>
                        <div id="ai-body">
                            <div class="ai-msg ai-bot">Chào bạn! Nhập diện tích (VD: 50m2 ngõ hoặc 60m2 mặt phố) để mình tính giá nhanh nhé! 🏠</div>
                        </div>
                        <div id="ai-footer">
                            <div id="ai-chips">
                                <div class="ai-chip">🏠 Ngõ 30m2</div>
                                <div class="ai-chip">🏠 Ngõ 50m2</div>
                                <div class="ai-chip">🏪 Mặt phố 60m2</div>
                            </div>
                            <div id="ai-input-wrap">
                                <input id="ai-input" type="text" placeholder="VD: 45m2 trong ngõ..." autocomplete="off">
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

            toggle.onclick = () => { 
                box.style.display = 'flex'; toggle.style.opacity = '0'; toggle.style.pointerEvents = 'none';
                if(window.innerWidth > 480) inp.focus(); document.body.style.overflow = 'hidden';
            };
            document.getElementById('ai-close').onclick = () => { 
                box.style.display = 'none'; toggle.style.opacity = '1'; toggle.style.pointerEvents = 'auto';
                document.body.style.overflow = '';
            };

            const sendMsg = async () => {
                const txt = inp.value.trim(); if(!txt) return;
                addMsg(txt, 'user'); inp.value = '';
                const typing = document.createElement('div'); typing.className = 'ai-msg ai-bot ai-typing'; typing.innerText = 'Đang tính toán...';
                document.getElementById('ai-body').appendChild(typing); scrollToBottom();
                setTimeout(() => {
                    typing.remove();
                    const res = Brain.findAnswer(txt);
                    if(res.type !== 'fallback') {
                        addMsg(res.text, 'bot');
                        if(res.type === 'calc') {
                            setTimeout(()=> addMsg("Bạn có muốn xem danh sách nhà đang bán theo mức giá này không?", 'bot'), 1000);
                        }
                    } else {
                        addMsg(`Mình chưa hiểu rõ ý "${txt}". Bạn thử nhập: "50m2 trong ngõ" xem sao nhé!`, 'bot');
                    }
                }, 800);
            };

            document.getElementById('ai-send').onclick = sendMsg;
            inp.onkeypress = (e) => { if(e.key==='Enter') sendMsg(); };
            
            // Xử lý nút Chips bấm vào là tự gửi luôn
            document.querySelectorAll('.ai-chip').forEach(c => {
                c.onclick = () => { 
                    // Lấy text từ chip, bỏ icon nếu có
                    let txt = c.innerText;
                    if(txt.includes("Ngõ 30m2")) txt = "Nhà trong ngõ 30m2";
                    else if(txt.includes("Ngõ 50m2")) txt = "Nhà trong ngõ 50m2";
                    else if(txt.includes("Mặt phố 60m2")) txt = "Mặt phố 60m2";
                    
                    addMsg(txt, 'user');
                    // Trigger gửi tin giả lập
                    const typing = document.createElement('div'); typing.className = 'ai-msg ai-bot ai-typing'; typing.innerText = 'Đang tính toán...';
                    document.getElementById('ai-body').appendChild(typing); scrollToBottom();
                    setTimeout(() => {
                        typing.remove();
                        const res = Brain.findAnswer(txt);
                        addMsg(res.text, 'bot');
                    }, 800);
                };
            });

            const addMsg = (text, type) => {
                const div = document.createElement('div'); div.className = `ai-msg ai-${type}`; div.innerText = text;
                document.getElementById('ai-body').appendChild(div); scrollToBottom();
            };
            const scrollToBottom = () => { const b = document.getElementById('ai-body'); b.scrollTop = b.scrollHeight; }
        }
    };

    window.addEventListener('DOMContentLoaded', () => { setTimeout(() => { Brain.learn(); UI.init(); }, 1000); });
})();
