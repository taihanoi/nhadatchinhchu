/* RealEstateAI_v3_MobileFixed.js
   ✅ Giao diện: Góc TRÁI màn hình.
   ✅ UI/UX: Né thanh điều hướng iPhone (Safe Area).
   ✅ Fix lỗi iPhone: Khi mở bàn phím, giao diện chat tự động co giãn full màn hình để không bị che.
   ✅ Logic: Vẫn giữ AI thông minh như bản V2.
*/

(function() {
    // === 1. CẤU HÌNH ===
    const CONFIG = {
        name: "Trợ Lý Nhà Đất LB",
        phone: "0845622012",
        zalo: "https://zalo.me/0845622012",
        avatar: "https://i.postimg.cc/T2cW9Yk6/IMG-5191.png",
        color: "#0084FF",
        learnSources: ["#vip-listing h2", "#vip-listing p", "#vip-listing li", "#banggia h3", "#banggia span", "#khuvuc h3", "#khuvuc p", "#faq summary", "#faq div", ".prose p"]
    };

    // === 2. AI BRAIN (Logic tìm kiếm) ===
    const Brain = {
        data: [],
        extractPrice: function(text) {
            const matches = text.match(/(\d+[,.]?\d*)\s*(tỷ|ty|ti)/i);
            return matches ? parseFloat(matches[1].replace(',', '.')) : null;
        },
        learn: function() {
            Brain.data = [];
            document.querySelectorAll(CONFIG.learnSources.join(",")).forEach(el => {
                const text = el.innerText.replace(/\s+/g, ' ').trim();
                if (text.length > 15) {
                    Brain.data.push({ text: text, price: Brain.extractPrice(text), type: el.closest('#banggia') ? 'price' : 'info' });
                }
            });
            console.log(`🧠 AI đã học ${Brain.data.length} dữ liệu.`);
        },
        findAnswer: function(query) {
            const q = query.toLowerCase();
            const qPrice = Brain.extractPrice(q);
            if (/^(hi|helo|chào|alo)/i.test(q) && q.length < 15) return { type: 'chat', text: "Chào bạn! Mình là AI hỗ trợ tìm nhà Long Biên. Bạn cần tìm nhà khu vực nào hay tầm giá bao nhiêu?" };
            if (/(liên hệ|sđt|hotline|zalo)/i.test(q)) return { type: 'contact', text: `Hotline: ${CONFIG.phone} (Zalo). Mình hỗ trợ 24/7 nhé!` };
            
            let best = null, max = 0;
            Brain.data.forEach(item => {
                let score = 0;
                q.split(" ").forEach(w => { if (item.text.toLowerCase().includes(w)) score++; });
                if (qPrice && item.price && Math.abs(qPrice - item.price) <= 1.0) score += 5;
                if (score > max) { max = score; best = item; }
            });
            return (max >= 2 && best) ? { type: 'result', text: best.text } : { type: 'fallback', text: null };
        }
    };

    // === 3. UI MESSENGER (Tối ưu Mobile) ===
    const UI = {
        init: function() {
            const style = document.createElement('style');
            style.innerHTML = `
                /* Nút mở chat: Cố định góc trái, nâng cao né thanh iPhone */
                #ai-toggle { 
                    position: fixed; 
                    bottom: max(20px, env(safe-area-inset-bottom) + 20px); /* Né thanh Home iPhone */
                    left: 20px; 
                    width: 60px; height: 60px; 
                    background: ${CONFIG.color}; 
                    border-radius: 50%; border: none; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
                    z-index: 9990; cursor: pointer; 
                    display: flex; align-items: center; justify-content: center;
                    transition: transform 0.2s;
                }
                #ai-toggle:active { transform: scale(0.9); }
                #ai-toggle svg { width: 30px; height: 30px; fill: white; }

                /* Khung Chat */
                #ai-box { 
                    position: fixed; z-index: 9999; 
                    background: #fff; display: none; flex-direction: column; 
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2); overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                /* Desktop Style (Màn hình lớn) */
                @media (min-width: 481px) {
                    #ai-box {
                        width: 360px; height: 550px; 
                        bottom: 90px; left: 20px; 
                        border-radius: 16px; 
                        border: 1px solid #eee;
                    }
                }

                /* Mobile Style (Màn hình nhỏ - iPhone) */
                @media (max-width: 480px) {
                    #ai-box {
                        width: 100%; height: 100%; /* Full màn hình */
                        height: 100dvh; /* Dynamic Height để tránh lỗi thanh địa chỉ */
                        top: 0; left: 0; bottom: 0; right: 0;
                        border-radius: 0;
                    }
                    /* Khi bàn phím mở, header vẫn dính top, input vẫn dính bottom */
                }

                #ai-header { 
                    padding: 15px; background: ${CONFIG.color}; color: white; 
                    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
                    padding-top: max(15px, env(safe-area-inset-top)); /* Né tai thỏ iPhone */
                }
                #ai-header img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); }
                #ai-close { margin-left: auto; background: none; border: none; color: white; font-size: 24px; padding: 5px; }

                #ai-body { 
                    flex: 1; overflow-y: auto; padding: 15px; 
                    background: #f0f2f5; display: flex; flex-direction: column; gap: 10px; 
                    overscroll-behavior: contain; /* Chặn cuộn trang web nền */
                }
                
                .ai-msg { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 15px; line-height: 1.4; }
                .ai-bot { background: white; align-self: flex-start; color: #1c1e21; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border-bottom-left-radius: 4px; }
                .ai-user { background: ${CONFIG.color}; align-self: flex-end; color: white; border-bottom-right-radius: 4px; }

                /* Khu vực nhập liệu: Dính đáy, né Home Indicator */
                #ai-footer {
                    background: white; border-top: 1px solid #eee; padding: 10px;
                    padding-bottom: max(10px, env(safe-area-inset-bottom)); /* Quan trọng cho iPhone X+ */
                    flex-shrink: 0;
                }
                #ai-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
                .ai-chip { background: #e4e6eb; padding: 8px 14px; border-radius: 20px; font-size: 13px; white-space: nowrap; font-weight: 500; color: #050505; }
                
                #ai-input-wrap { display: flex; gap: 10px; align-items: center; }
                #ai-input { flex: 1; padding: 12px; border-radius: 24px; border: 1px solid #ddd; outline: none; font-size: 16px; /* Font 16px để iOS không zoom */ background: #f0f2f5; }
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
                            <div><div style="font-weight:700">${CONFIG.name}</div><div style="font-size:11px;opacity:0.9">● Trực tuyến</div></div>
                            <button id="ai-close">×</button>
                        </div>
                        <div id="ai-body">
                            <div class="ai-msg ai-bot">Chào bạn! Mình có thể giúp gì cho bạn về nhà đất Long Biên? 🏠</div>
                        </div>
                        <div id="ai-footer">
                            <div id="ai-chips">
                                <div class="ai-chip">💰 Giá nhà Bồ Đề</div>
                                <div class="ai-chip">🚗 Ô tô vào nhà</div>
                                <div class="ai-chip">📄 Thủ tục</div>
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

            // Logic Events
            const box = document.getElementById('ai-box');
            const toggle = document.getElementById('ai-toggle');
            const inp = document.getElementById('ai-input');

            toggle.onclick = () => { 
                box.style.display = 'flex'; 
                toggle.style.opacity = '0'; toggle.style.pointerEvents = 'none';
                if(window.innerWidth > 480) inp.focus(); // Desktop thì focus luôn
                document.body.style.overflow = 'hidden'; // Khóa cuộn trang web nền
            };
            
            document.getElementById('ai-close').onclick = () => { 
                box.style.display = 'none'; 
                toggle.style.opacity = '1'; toggle.style.pointerEvents = 'auto';
                document.body.style.overflow = ''; // Mở khóa cuộn
            };

            const sendMsg = async () => {
                const txt = inp.value.trim();
                if(!txt) return;
                
                // Add user msg
                addMsg(txt, 'user');
                inp.value = '';

                // Typing UI
                const typing = document.createElement('div');
                typing.className = 'ai-msg ai-bot ai-typing';
                typing.innerText = 'Đang nhập...';
                document.getElementById('ai-body').appendChild(typing);
                scrollToBottom();

                // AI Answer
                setTimeout(() => {
                    typing.remove();
                    const res = Brain.findAnswer(txt);
                    if(res.type !== 'fallback') {
                        addMsg(res.text, 'bot');
                    } else {
                        addMsg(`Hiện chưa có thông tin chính xác cho "${txt}".`, 'bot');
                        setTimeout(() => addMsg(`Bạn tài chính khoảng bao nhiêu tỷ để mình tìm căn phù hợp?`, 'bot'), 600);
                    }
                }, 800);
            };

            document.getElementById('ai-send').onclick = sendMsg;
            inp.onkeypress = (e) => { if(e.key==='Enter') sendMsg(); };
            
            // Chip click
            document.querySelectorAll('.ai-chip').forEach(c => {
                c.onclick = () => { inp.value = c.innerText.substring(2).trim(); sendMsg(); };
            });

            const addMsg = (text, type) => {
                const div = document.createElement('div');
                div.className = `ai-msg ai-${type}`;
                div.innerText = text;
                document.getElementById('ai-body').appendChild(div);
                scrollToBottom();
            };

            const scrollToBottom = () => {
                const b = document.getElementById('ai-body');
                b.scrollTop = b.scrollHeight;
            }
        }
    };

    // === 4. RUN ===
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => { Brain.learn(); UI.init(); }, 1000);
    });
})();
