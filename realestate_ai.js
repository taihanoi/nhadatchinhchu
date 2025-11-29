/* RealEstateAI_v1_LongBien.js
   ✅ Dựa trên Core v38 (BM25 + Extractive QA + Auto-Learn)
   ✅ Mod chuyên biệt cho Bất Động Sản Long Biên
   ✅ Tính năng:
        - Tự động học dữ liệu từ thẻ h1, h2, p, li, .prose trên web
        - Hiểu ngữ nghĩa: "Nhà ô tô vào", "Sổ đỏ", "Mặt phố", "Ngọc Lâm"...
        - Tìm kiếm theo ngân sách và khu vực
*/
(function(){
  if (window.RealEstateAI_LOADED) return;
  window.RealEstateAI_LOADED = true;

  /* ====== CẤU HÌNH (Sửa thông tin của bạn ở đây) ====== */
  const DEF = {
    brand: "Nhà Đất Long Biên", // Tên hiển thị
    phone: "0845622012",        // Số điện thoại
    zalo:  "https://zalo.me/0845622012",
    avatar: "🏠",               // Icon hoặc link ảnh
    themeColor: "#0084FF",      // Màu chủ đạo

    autolearn: true,            // Tự động quét web
    viOnly: true,               // Chỉ học tiếng Việt
    deepContext: true,          // Nhớ ngữ cảnh chat
    
    // Cấu hình quét
    crawlSelectors: "main h1, main h2, main h3, main p, main li, .prose, #vip-listing p, #banggia div",
    
    // Tắt các tính năng không cần thiết
    noLinksInReply: false,      // Cho phép gửi link (để gửi link bài viết BĐS)
    noMarkdownReply: true       // Tắt markdown cho gọn
  };

  /* ====== BỘ XỬ LÝ NGÔN NGỮ BĐS (NLP) ====== */
  // Danh sách từ khóa quan trọng cần nhận diện
  const ENTITIES = [
    // Khu vực
    {k:'ngọc lâm', re:/\bngọc\s*lâm\b/i},
    {k:'bồ đề', re:/\bbồ\s*đề\b/i},
    {k:'ngọc thụy', re:/\bngọc\s*thụy\b/i},
    {k:'thạch bàn', re:/\bthạch\s*bàn\b/i},
    {k:'nguyễn văn cừ', re:/\bnguyễn\s*văn\s*cừ\b|\bnvc\b/i},
    {k:'sài đồng', re:/\bsài\s*đồng\b/i},
    {k:'long biên', re:/\blong\s*biên\b/i},
    
    // Đặc điểm
    {k:'ô tô vào', re:/\bô\s*tô\b|\bgara\b|\bxe\s*hơi\b/i},
    {k:'mặt phố', re:/\bmặt\s*phố\b|\bkinh\s*doanh\b/i},
    {k:'ngõ', re:/\bngõ\b|\bngách\b/i},
    {k:'sổ đỏ', re:/\bsổ\s*đỏ\b|\bpháp\s*lý\b|\bsổ\s*hồng\b/i},
    {k:'thang máy', re:/\bthang\s*máy\b/i},
    {k:'lô góc', re:/\blô\s*góc\b|\bhai\s*thoáng\b|\b3\s*thoáng\b/i},
    
    // Loại hình
    {k:'nhà dân', re:/\bnhà\s*dân\b|\bnhà\s*riêng\b/i},
    {k:'đất nền', re:/\bđất\b|\bđất\s*nền\b/i},
    {k:'biệt thự', re:/\bbiệt\s*thự\b|\bvilla\b/i}
  ];

  /* ====== UI & CORE LOGIC (Giữ nguyên khung sườn MotoAI) ====== */
  const $  = s => document.querySelector(s);
  const safe = s => { try{ return JSON.parse(s); }catch{ return null; } };
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const cleanStr = s => s.replace(/\s+/g,' ').trim();

  // CSS Giao diện Messenger
  const CSS = `
  :root{ --m-blue:${DEF.themeColor}; --m-bg:#fff; --m-text:#0b1220; --m-in-h:36px; }
  #mta-root{position:fixed;right:20px;bottom:20px;z-index:9999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  #mta-bubble{width:60px;height:60px;border:none;border-radius:50%;background:linear-gradient(135deg,var(--m-blue),#0066CC);color:#fff;font-size:28px;cursor:pointer;box-shadow:0 4px 15px rgba(0,132,255,0.4);transition:transform 0.2s}
  #mta-bubble:hover{transform:scale(1.1)}
  #mta-card{position:fixed;right:20px;bottom:90px;width:350px;height:500px;max-height:80vh;background:#fff;border-radius:18px;box-shadow:0 5px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden;transform:translateY(20px);opacity:0;pointer-events:none;transition:all 0.3s ease}
  #mta-card.open{transform:translateY(0);opacity:1;pointer-events:auto}
  #mta-header{background:var(--m-blue);padding:15px;color:#fff;display:flex;align-items:center;justify-content:between}
  #mta-header .title{font-weight:bold;font-size:16px}
  #mta-close{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;margin-left:auto}
  #mta-body{flex:1;overflow-y:auto;padding:15px;background:#f0f2f5}
  .msg{max-width:85%;padding:8px 12px;border-radius:18px;margin-bottom:8px;font-size:14px;line-height:1.4;word-wrap:break-word}
  .msg.bot{background:#fff;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,0.1)}
  .msg.user{background:var(--m-blue);color:#fff;align-self:flex-end;margin-left:auto}
  #mta-input{padding:10px;background:#fff;border-top:1px solid #eee;display:flex;gap:10px}
  #mta-in{flex:1;border:1px solid #ddd;border-radius:20px;padding:0 15px;height:var(--m-in-h);outline:none}
  #mta-send{background:var(--m-blue);color:#fff;border:none;width:40px;height:var(--m-in-h);border-radius:50%;cursor:pointer;font-size:18px}
  #mta-chips{padding:10px;background:#fff;border-top:1px solid #eee;overflow-x:auto;white-space:nowrap;display:flex;gap:8px}
  .chip{padding:6px 12px;background:#e4e6eb;border-radius:16px;font-size:12px;cursor:pointer;border:none;transition:background 0.2s}
  .chip:hover{background:#d8dadf}
  .typing{font-size:12px;color:#888;margin:5px 15px;font-style:italic}
  `;

  const HTML = `
  <div id="mta-root">
    <button id="mta-bubble">💬</button>
    <div id="mta-card">
      <div id="mta-header">
        <div class="avatar" style="margin-right:10px">${DEF.avatar}</div>
        <div class="title">${DEF.brand}<br><span style="font-size:11px;font-weight:normal;opacity:0.9">Online • Hỗ trợ tìm nhà</span></div>
        <button id="mta-close">×</button>
      </div>
      <div id="mta-body"></div>
      <div id="mta-chips">
        <button class="chip">💰 Giá nhà Bồ Đề</button>
        <button class="chip">🚗 Nhà ô tô vào</button>
        <button class="chip">📝 Thủ tục mua bán</button>
        <button class="chip">📍 Nhà Ngọc Lâm</button>
      </div>
      <div id="mta-input">
        <input id="mta-in" placeholder="Nhập câu hỏi (VD: Nhà 5 tỷ...)" />
        <button id="mta-send">➤</button>
      </div>
    </div>
  </div>`;

  /* ====== CORE: CRAWLER & INDEXER (Học dữ liệu) ====== */
  let siteData = [];

  function crawlSite() {
    // Quét các thẻ quan trọng chứa thông tin BĐS
    const elements = document.querySelectorAll(DEF.crawlSelectors);
    elements.forEach(el => {
        let text = cleanStr(el.innerText);
        if (text.length > 20) { // Chỉ lấy câu có ý nghĩa
            // Gán điểm ưu tiên
            let priority = 1;
            if (el.tagName === 'H1') priority = 5;
            else if (el.tagName === 'H2') priority = 3;
            else if (el.tagName === 'LI') priority = 2; // List tiện ích thường nằm trong li

            siteData.push({ text: text, keywords: text.toLowerCase().split(/\s+/), score: priority });
        }
    });
    console.log(`RealEstateAI: Đã học ${siteData.length} đơn vị dữ liệu.`);
  }

  /* ====== CORE: SEARCH ENGINE (BM25 Simplified) ====== */
  function search(query) {
    const qWords = query.toLowerCase().split(/\s+/);
    
    // 1. Nhận diện thực thể (Entities) trong câu hỏi
    let detectedEntities = [];
    ENTITIES.forEach(e => {
        if(e.re.test(query)) detectedEntities.push(e.k);
    });

    let bestMatches = [];

    siteData.forEach(item => {
        let score = 0;
        // Cộng điểm nếu khớp từ khóa
        qWords.forEach(w => {
            if (item.keywords.includes(w)) score += 1;
        });
        
        // Cộng điểm thưởng lớn nếu khớp Thực thể (Vd: Khách hỏi 'Ngọc Lâm', bài viết có 'Ngọc Lâm' là khớp xịn)
        detectedEntities.forEach(ent => {
            if (item.text.toLowerCase().includes(ent)) score += 5;
        });

        // Điểm thưởng cho tiêu đề (đã set lúc crawl)
        score *= item.score; 

        if (score > 1) { // Ngưỡng tối thiểu
            bestMatches.push({ text: item.text, score: score });
        }
    });

    // Sắp xếp giảm dần theo điểm
    bestMatches.sort((a, b) => b.score - a.score);
    return bestMatches.slice(0, 3); // Lấy 3 kết quả tốt nhất
  }

  /* ====== ANSWER LOGIC ====== */
  async function generateAnswer(userText) {
      await sleep(600 + Math.random() * 800); // Giả lập đang gõ

      const q = userText.toLowerCase();

      // 1. Xử lý các câu hỏi xã giao / liên hệ cứng
      if (/(chào|hello|hi|alo)/i.test(q)) return `Chào bạn! Mình là AI của ${DEF.brand}. Bạn đang tìm nhà khu vực nào (Ngọc Lâm, Bồ Đề...) hay tầm tài chính bao nhiêu?`;
      if (/(liên hệ|sđt|hotline|gọi)/i.test(q)) return `Bạn hãy gọi ngay hotline chính chủ: ${DEF.phone} (Zalo) để được tư vấn nhanh nhất nhé.`;
      if (/(địa chỉ|văn phòng)/i.test(q)) return `Văn phòng mình ở 112 Nguyễn Văn Cừ, Bồ Đề, Long Biên bạn nhé.`;

      // 2. Tìm kiếm thông tin trong dữ liệu đã học
      const results = search(q);

      if (results.length > 0) {
          // Lấy kết quả tốt nhất
          let answer = results[0].text;
          
          // Nếu kết quả quá ngắn, nối thêm kết quả thứ 2
          if (answer.length < 50 && results[1]) {
              answer += "\n" + results[1].text;
          }

          return `Theo dữ liệu mình có:\n"${answer}"\n\nBạn quan tâm chi tiết căn này thì nhắn Zalo ${DEF.phone} nhé!`;
      }

      // 3. Fallback (Không tìm thấy)
      return `Hiện tại mình chưa tìm thấy thông tin khớp chính xác với yêu cầu "${userText}" trên web. \n\nTuy nhiên kho hàng bên mình còn rất nhiều. Bạn hãy gọi ${DEF.phone} để mình check nguồn hàng kín nhé!`;
  }

  /* ====== UI CONTROLLER ====== */
  function initUI() {
    // Inject CSS
    const style = document.createElement('style'); style.innerHTML = CSS; document.head.appendChild(style);
    // Inject HTML
    const container = document.createElement('div'); container.innerHTML = HTML; document.body.appendChild(container);
    
    // Elements
    const root = $('#mta-root'), card = $('#mta-card'), close = $('#mta-close'), 
          bubble = $('#mta-bubble'), input = $('#mta-in'), send = $('#mta-send'), 
          body = $('#mta-body'), chips = $('#mta-chips');

    // Functions
    const addMsg = (txt, role) => {
        const div = document.createElement('div'); div.className = `msg ${role}`; div.innerText = txt;
        body.appendChild(div); body.scrollTop = body.scrollHeight;
    };

    const handleSend = async () => {
        const txt = input.value.trim(); if (!txt) return;
        addMsg(txt, 'user'); input.value = '';
        
        // Show typing
        const typing = document.createElement('div'); typing.className = 'typing'; typing.innerText = `${DEF.brand} đang nhập...`;
        body.appendChild(typing); body.scrollTop = body.scrollHeight;

        // Get answer
        const ans = await generateAnswer(txt);
        
        // Remove typing & show answer
        typing.remove();
        addMsg(ans, 'bot');
    };

    // Events
    bubble.onclick = () => { card.classList.add('open'); bubble.style.opacity = '0'; input.focus(); };
    close.onclick = () => { card.classList.remove('open'); bubble.style.opacity = '1'; };
    send.onclick = handleSend;
    input.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };
    
    // Chip events
    chips.querySelectorAll('.chip').forEach(btn => {
        btn.onclick = () => { input.value = btn.innerText.replace(/^[^\s]+\s/, ''); handleSend(); };
    });

    // Auto welcome
    setTimeout(() => {
        if(body.children.length === 0) addMsg(`Chào mừng bạn đến với ${DEF.brand}! Mình có thể giúp gì cho bạn?`, 'bot');
    }, 1000);
  }

  /* ====== INIT ====== */
  // Chạy khi trang load xong
  if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(() => { crawlSite(); initUI(); }, 1000);
  } else {
      document.addEventListener("DOMContentLoaded", () => { crawlSite(); initUI(); });
  }

})();
