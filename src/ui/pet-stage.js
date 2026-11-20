import { MASCOT_TEMPLATES, renderMascotSvg } from '../assets/mascots.js';

const PET_QUIPS = {
  'loi-kiem': {
    vi: [
      'Lôi Chi Hô Hấp: Thức thứ 9 - Git Push Force lên Main! ⚡🔥',
      'Chém bug như chém gió, đến lúc build thì toang hoác! 🗡️💀',
      'Tốc độ gõ 150 WPM nhưng fix cái bug mất 3 ngày à bro? ⚡',
      'Kiếm bén cỡ nào cũng không chém nổi quả bug thiếu dấu chấm phẩy đâu! 🗡️',
      'Đang chém code hăng say thì sập server... rút kiếm chém sếp liền! ⚡',
      'Dũng sĩ diệt bug hay dũng sĩ sinh ra bug thế? 🗡️👀',
      'Test thẳng trên production đi, kiếm sĩ chân chính sợ gì ai! ⚡'
    ],
    en: [
      'Thunder Breathing: Ninth Form - Force Push to Main! ⚡🔥',
      'Slashing bugs at 150 WPM... still broke the build though! 🗡️💀',
      'Your blade is sharp, but your regex is cursed beyond repair. ⚡',
      'No katana in the world can cut through a missing semicolon! 🗡️',
      'Real warriors test directly in production! Slay or be slayed! ⚡',
      'Are you fixing bugs or just spawning new ones with style? 🗡️👀',
      'Server crashed! Keep calm and draw your sword against the PM! ⚡'
    ]
  },
  'rong-ngoc': {
    vi: [
      'Rồng thần cũng xin quỳ trước quả logic siêu thực này của nhà ngươi! 🐉',
      'Ước code không bug à? Rồng thần bảo: Ước cái gì thực tế hơn đi bạn ơi! ✨',
      'Hào quang ngọc bích soi rọi đống tech debt từ 5 năm trước chưa dọn! 🐉',
      'Deploy chiều thứ Sáu? Đến loài rồng bất tử còn không dám liều mạng thế! 🔥',
      'Triệu hồi rồng ngọc ngàn năm chỉ để hỏi cách căn giữa một cái thẻ div? 🐉',
      'Bảo trì hệ thống 5 phút thành 5 tiếng rồi đấy, thần long cũng cứu không nổi! 💀',
      'Long vương phán: Bug này không phải lỗi, đây là một tính năng thần bí! ✨'
    ],
    en: [
      'Even the Ancient Dragon cannot fathom this spaghetti logic! 🐉',
      'You wish for zero bugs? Ask for something realistic like a pet unicorn! ✨',
      'Behold! Emerald radiance illuminating 5 years of uncleaned tech debt! 🐉',
      'Deploying on Friday afternoon? Even immortal dragons fear that curse! 🔥',
      'You summoned the mythical dragon... just to ask how to center a div? 🐉',
      'Estimated 5-minute maintenance turned into 5 hours of sheer panic! 💀',
      'Dragon decree: This is not a bug, it is a sacred mystical feature! ✨'
    ]
  },
  'ho-ly-chibi': {
    vi: [
      'Ủa ai viết đống code rác này vậy nè? Git blame thử đi rồi tự khóc! 🦊',
      'Chọt chọt cái gì! Task Jira từ tuần trước đã tick Done chưa dọ? 🐾',
      'Code chạy ngon trên máy em mà! Nhưng khách có mua máy em đâu? 🦊',
      'Lại copy code AI về paste mà không thèm đọc đúng không, bắt quả tang nha! 🦊✨',
      'Nghỉ tay uống miếng nước đi, ngồi cong lưng cột sống thành dấu chấm phẩy rồi kìa! 🍵',
      'Bug khó quá thì tắt máy đi ngủ, mai tỉnh dậy bug vẫn còn đó chờ bạn mà~ 🦊💤',
      'Lương nghìn đô mà cái bug 500 Internal Error tìm cả buổi không ra dọ? 🦊'
    ],
    en: [
      'Who wrote this monstrosity? Run git blame and prepare to cry! 🦊',
      'Stop poking me! Did you close that Jira ticket from last sprint? 🐾',
      'It works on my machine! Too bad we do not sell your laptop to clients! 🦊',
      'Caught you copying AI code without even reading the comments! 🦊✨',
      'Hydrate now! Your spine is currently shaped like a semicolon! 🍵',
      'Stuck on a bug? Go to sleep, it will still be waiting tomorrow morning~ 🦊💤',
      'Senior salary, yet puzzled by a simple 500 Internal Server Error? 🦊'
    ]
  },
  'meo-than': {
    vi: [
      'Meow~ Thay vì ngồi sửa bug vô vọng, hãy cung phụng pate cho mèo đi! 🐱',
      'Sếp đang đi lướt phía sau kìa, bấm Alt + Tab lẹ không là toang! 🐾',
      'Console.log("vào đây chưa ta") lần thứ 99 rồi đấy bro... 🐱',
      'Deadline dí sát mông rồi mà vẫn ngồi đây gãi bụng mèo à? Dũng cảm đấy! 🐾',
      'Mèo vừa giẫm lên bàn phím, trông code còn sạch hơn bạn tự viết đấy! 🐱',
      'Tính năng này không có lỗi, đó là tính năng tạo bất ngờ cho tester! 🐾',
      'Xóa node_modules đi cài lại xem? Không được thì đổ tại môi trường! 🐱✨'
    ],
    en: [
      'Meow~ Stop fixing bugs and feed your feline overlord already! 🐱',
      'Boss detected approaching from behind! Alt + Tab IMMEDIATELY! 🐾',
      'Console.log("here pls work") for the 99th time today... Found it yet? 🐱',
      'Deadline is in 2 hours and you are petting a virtual cat? Pure courage. 🐾',
      'I walked on your keyboard and accidentally improved your code quality. 🐱',
      'It is not a bug, it is an element of surprise for QA testers! 🐾',
      'Delete node_modules and npm install again? If it fails, blame the OS! 🐱✨'
    ]
  },
  'meo-huyen-thuat': {
    vi: [
      'Úm ba la xì bùa... Biến 1 warning vô hại thành 20 fatal errors! 🔮✨',
      'Ma pháp tối thượng: rm -rf node_modules rồi ngồi tải lại cả thế giới! 🔥',
      'Quy luật huyền bí: Bug chỉ xuất hiện khi bật màn hình share cho sếp xem! 🪄',
      'Lỗi này không phải do code đâu, do phong thủy bàn làm việc khắc mệnh đấy! 🔮',
      'Triệu hồi ma thuật phòng thủ: Đổ tại lỗi mạng và bên thứ ba sập! 🕯️',
      'Cầu nguyện đi! Commit tiếp theo tỉ lệ cao là nát tan nát bét cả hệ thống! 🔥',
      'Năng lượng vũ trụ mách bảo: Hôm nay không nên deploy cái gì hết! 🔮'
    ],
    en: [
      'Abra-ca-dabra! Turned 1 benign warning into 20 fatal build errors! 🔮✨',
      'Forbidden dark spell: rm -rf node_modules and re-download the internet! 🔥',
      'Mystic law: Bugs only manifest when screen-sharing with the client! 🪄',
      'Not a syntax error. Clearly bad feng shui at your workstation. 🔮',
      'Summon the ultimate defensive spell: Blame third-party API outages! 🕯️',
      'Say your prayers! That upcoming commit has high destructive potential! 🔥',
      'Cosmic omen: Today is definitively not a good day to deploy! 🔮'
    ]
  },
  'phu-thuy-anh-trang': {
    vi: [
      'Lại thức đêm cày code à? Đếm xem đầu còn bao nhiêu cọng tóc nữa bạn ơi? 🌙🧹',
      'Pha chế thần dược tăng ca: 10% cà phê, 90% nước mắt của lập trình viên! ✨',
      'Trăng thanh gió mát, thời khắc hoàng đạo để merge conflict 300 files! 🌕',
      'Deploy lúc 0h đêm: Cảm giác tim đập chân run hơn cả xem phim kinh dị! 🌙',
      'Dev bảo tính năng này làm 2 tiếng là xong, và đó là chuyện của 2 tuần trước! 🧹',
      'Ngủ đi bạn ơi, thức khuya code chỉ sinh thêm bug quái vật thôi! 🌙💤',
      'Ước lượng thời gian chuẩn của dev: Lấy số ước tính nhân 3 rồi đổi sang đơn vị lớn hơn! ✨'
    ],
    en: [
      'Midnight coding session? Count your remaining hair strands, darling! 🌙🧹',
      'Brewing developer potion: 10% caffeine, 90% existential dread! ✨',
      'Full moon tonight! Perfect mystical hour to resolve 300 merge conflicts! 🌕',
      'Midnight prod deploy: Heart rate higher than any horror movie jump-scare! 🌙',
      'You said this task takes 2 hours... that was two weeks ago! 🧹',
      'Go to sleep! Coding while sleep-deprived only breeds monster bugs! 🌙💤',
      'Developer estimation rule: Multiply by 3 and bump to the next time unit! ✨'
    ]
  },
  'hoa-anh-dao': {
    vi: [
      'Cánh hoa rơi nghiêng như cách server production sắp sập vậy~ 🌸',
      'Bình tĩnh hít một hơi thật sâu... rồi gõ git reset --hard làm lại cuộc đời! ✨',
      'Mọi thứ ở đây đều đẹp đẽ thơ mộng, trừ cái database schema của bạn ra! 🌸',
      'Tâm bất biến giữa dòng đời vạn bug, kệ đời PM dí ta cứ thong dong~ 🍵',
      '// TODO: Sẽ tối ưu lại chỗ này (lần sửa cuối: 3 năm trước) 🌸',
      'Code viết như thơ, tiếc là thơ trừu tượng siêu thực không ai hiểu nổi! ✨',
      'Bình tĩnh nhấp chén trà, đợi sếp chửi xong rồi ta fix tiếp~ 🌸'
    ],
    en: [
      'Cherry blossoms fall gracefully, just like your production servers~ 🌸',
      'Take a deep breath of spring air... then git reset --hard your life choices! ✨',
      'Everything here is poetic and beautiful, except your database schema! 🌸',
      'Inner peace amidst a storm of exceptions... let the PM ping in vain~ 🍵',
      '// TODO: will refactor this later (last committed: 3 years ago) 🌸',
      'Your code is like abstract poetry: aesthetically pleasing, completely unreadable! ✨',
      'Sip some green tea calmly while the CI/CD pipeline burns down in red~ 🌸'
    ]
  },
  'den-long': {
    vi: [
      'Đèn soi sáng con đường cho bạn... đi thẳng vào ngõ cụt kiến trúc! 🏮',
      'Thắp đèn lên xem ai vừa lén commit code thẳng vào branch master/main! 🏮👀',
      'Dầu đèn thì có thể cạn, chứ deadline với bug thì thiên thu bất tận! ✨',
      'Ánh đèn lung linh rạng ngời, sáng rực như màn hình xanh chết chóc (BSOD)! 💡',
      'Soi đèn tìm bug cả ngày, hóa ra do gõ nhầm tên biến một chữ cái! 🏮💀',
      'Đèn thắp giữa đêm khuya: Đài tưởng niệm sự hy sinh vì estimate ẩu! 🏮',
      'Sáng rực rỡ như tương lai của bạn khi tính năng vừa release bị crash ngay lập tức! 🏮'
    ],
    en: [
      'Guiding your path brightly... straight into architectural dead ends! 🏮',
      'Holding up the lantern to reveal who pushed unreviewed code to main! 🏮👀',
      'Oil in the lantern may run dry, but bugs and Jira tasks are eternal! ✨',
      'Radiant and glowing, as majestic as a fresh Blue Screen of Death! 💡',
      'Hunted for the bug for 6 hours... turned out to be a single typo! 🏮💀',
      'Lantern burning past 2 AM: A monument to reckless time estimates! 🏮',
      'Shining as brilliantly as your app crashing 5 seconds after release! 🏮'
    ]
  },
  'ca-koi': {
    vi: [
      'Cá Koi vượt vũ môn hóa rồng, dev vượt qua deadline thì hóa rồ! 🐟✨',
      'Bơi lội ngược dòng đời, lặn ngụp trong đống code thừa không ai dám xóa! 🌊',
      'May mắn của cá thần cũng không gánh nổi quả query quét sạch bảng không có Index! 🐟',
      'Nước biển mênh mông cũng không mặn bằng giọt nước mắt dev lúc rollback prod! 🌊',
      'Cứ bơi thong thả quẫy đuôi đi, khách hàng mới log có 50 cái bug P1 thôi mà! 🐟',
      'Chìm đắm trong vòng lặp vô tận (infinite loop), vĩnh viễn không có lối thoát! 🌊💀',
      'Bơi theo dòng sự kiện: Server sập thì cứ bảo do cá mập cắn cáp quang nhé! 🐟'
    ],
    en: [
      'Koi leaps over the gate to become a dragon; Dev survives deadline to become insane! 🐟✨',
      'Swimming through an ocean of legacy code that nobody dares to touch! 🌊',
      'All the luck in the cosmos cannot save a SELECT * query without an index! 🐟',
      'The sea is deep, but not as deep as dev tears during a prod rollback! 🌊',
      'Just keep swimming! QA only logged 50 critical P1 bugs this morning! 🐟',
      'Trapped in an infinite while-loop, swimming forever without a break condition! 🌊💀',
      'Whenever the server drops, just blame undersea sharks chewing fiber cables! 🐟'
    ]
  }
};

export class PetStage {
  constructor({ getConfig, getCustomMedia, onPositionSave }) {
    this.getConfig = getConfig;
    this.getCustomMedia = getCustomMedia;
    this.onPositionSave = onPositionSave;

    this.stageEl = null;
    this.bodyEl = null;
    this.speechEl = null;
    this.speechTimer = null;
    this.lastPetKey = '';
    this.pos = { x: 180, y: 120 };
    this.target = { x: 180, y: 120 };
    this.dragging = false;
    this.dragMoved = false;
    this.dragOffset = { x: 0, y: 0 };
    this.motionTimer = null;
    this.rafId = null;
    this.destroyed = false;

    this.onMouseMove = (e) => {
      const cfg = this.getConfig();
      if (cfg.pet?.mode === 'follow' && !this.dragging) {
        this.target.x = Math.min(window.innerWidth - 90, Math.max(16, e.clientX + 42));
        this.target.y = Math.min(window.innerHeight - 90, Math.max(16, e.clientY - 48));
      }
    };

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
  }

  ensureMounted() {
    if (this.stageEl && document.body.contains(this.stageEl)) return;
    const el = document.createElement('div');
    el.id = 'agy-ct-pet-stage';
    el.setAttribute('data-agy-ct-injected', 'true');
    el.innerHTML = `
      <div class="agy-ct-pet-speech" aria-live="polite"></div>
      <div class="agy-ct-pet-body"></div>
    `;
    document.body.appendChild(el);
    this.stageEl = el;
    this.bodyEl = el.querySelector('.agy-ct-pet-body');
    this.speechEl = el.querySelector('.agy-ct-pet-speech');
    this.bindInteractions();
  }

  bindInteractions() {
    if (!this.stageEl) return;

    this.stageEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.dragging = true;
      this.dragMoved = false;
      const rect = this.stageEl.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.stageEl.setPointerCapture?.(e.pointerId);
    });

    this.stageEl.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = Math.abs(e.clientX - this.dragStart.x);
      const dy = Math.abs(e.clientY - this.dragStart.y);
      if (dx > 4 || dy > 4) this.dragMoved = true;

      const size = this.getConfig().pet?.size || 88;
      this.pos.x = Math.max(8, Math.min(window.innerWidth - size - 8, e.clientX - this.dragOffset.x));
      this.pos.y = Math.max(8, Math.min(window.innerHeight - size - 8, e.clientY - this.dragOffset.y));
      this.target = { ...this.pos };
      this.applyCoords();
    });

    const finishDrag = () => {
      if (!this.dragging) return;
      this.dragging = false;
      if (this.dragMoved) {
        const xPct = Math.round((this.pos.x / Math.max(1, window.innerWidth)) * 1000) / 10;
        const yPct = Math.round((this.pos.y / Math.max(1, window.innerHeight)) * 1000) / 10;
        this.onPositionSave?.({ xPct, yPct });
      } else {
        this.triggerClickReaction();
      }
    };

    this.stageEl.addEventListener('pointerup', finishDrag);
    this.stageEl.addEventListener('pointercancel', finishDrag);
  }

  triggerClickReaction() {
    const cfg = this.getConfig();
    if (!cfg.pet?.showSpeechOnClick) return;
    const petId = cfg.pet.id;
    const lang = cfg.lang === 'en' ? 'en' : 'vi';
    const fallbackBank = lang === 'en'
      ? ['It works on my machine! 🤷', 'Keep calm and blame the cache! ⚡', 'Testing in prod? Brave soul! 💥', 'Coffee in, bugs out! ☕']
      : ['Code chạy trên máy em bình thường mà! 🤷', 'Bình tĩnh đổ tại cache đi bạn ơi! ⚡', 'Đang test thẳng trên prod à? Dũng cảm đấy! 💥', 'Cà phê vào, bug tự khắc bay màu! ☕'];
    const bank = PET_QUIPS[petId]?.[lang] || fallbackBank;
    const line = bank[Math.floor(Math.random() * bank.length)];

    if (this.speechEl) {
      this.speechEl.textContent = line;
      this.speechEl.classList.add('is-visible');
      clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        this.speechEl?.classList.remove('is-visible');
      }, 2800);
    }

    this.spawnBurstParticles();
  }

  spawnBurstParticles() {
    if (!this.stageEl) return;
    const rect = this.stageEl.getBoundingClientRect();
    const icons = ['✨', '⚡', '⭐', '💫'];
    for (let i = 0; i < 4; i++) {
      const sp = document.createElement('span');
      sp.className = 'agy-ct-pet-burst';
      sp.setAttribute('data-agy-ct-injected', 'true');
      sp.textContent = icons[Math.floor(Math.random() * icons.length)];
      sp.style.left = `${rect.left + rect.width * (0.25 + Math.random() * 0.5)}px`;
      sp.style.top = `${rect.top + rect.height * 0.3}px`;
      sp.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 54)}px`);
      sp.style.setProperty('--dy', `${Math.round(-26 - Math.random() * 34)}px`);
      document.body.appendChild(sp);
      setTimeout(() => sp.remove(), 950);
    }
  }

  update() {
    const cfg = this.getConfig();
    const pet = cfg.pet || {};

    if (!cfg.enabled || !pet.enabled || pet.id === 'none') {
      this.stopMotion();
      if (this.stageEl) {
        this.stageEl.remove();
        this.stageEl = null;
        this.bodyEl = null;
        this.speechEl = null;
        this.lastPetKey = '';
      }
      return;
    }

    this.ensureMounted();
    this.stageEl.style.display = 'block';

    const size = Math.max(44, Math.min(160, Number(pet.size) || 88));
    const opacity = Math.max(0.2, Math.min(1, (pet.opacity ?? 96) / 100));
    this.stageEl.style.width = `${size}px`;
    this.stageEl.style.height = `${size}px`;
    this.stageEl.style.opacity = String(opacity);

    const customUrl = this.getCustomMedia?.().pet || '';
    const renderKey = pet.id === 'custom' ? `custom:${customUrl}` : `tpl:${pet.id}`;
    if (this.lastPetKey !== renderKey) {
      this.lastPetKey = renderKey;
      if (pet.id === 'custom' && customUrl) {
        this.bodyEl.innerHTML = `<img src="${customUrl.replace(/"/g, '&quot;')}" alt="Custom Pet" style="width:100%;height:100%;object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.55));" />`;
      } else {
        const tplId = MASCOT_TEMPLATES[pet.id] ? pet.id : 'rong-ngoc';
        this.bodyEl.innerHTML = renderMascotSvg(tplId, 'pet');
      }
    }

    if (!this.dragging) {
      const xPct = pet.pos?.xPct ?? 16;
      const yPct = pet.pos?.yPct ?? 14;
      const px = Math.max(8, Math.min(window.innerWidth - size - 8, (xPct / 100) * window.innerWidth));
      const py = Math.max(8, Math.min(window.innerHeight - size - 8, (yPct / 100) * window.innerHeight));
      if (pet.mode === 'float') {
        this.pos = { x: px, y: py };
        this.target = { x: px, y: py };
      } else if (this.pos.x === 180 && this.pos.y === 120) {
        this.pos = { x: px, y: py };
        this.target = { x: px, y: py };
      }
      this.applyCoords();
    }

    this.configureMotion(pet.mode);
  }

  configureMotion(mode) {
    this.stopMotion();
    if (mode === 'float') return;

    if (mode === 'roam') {
      const pickNext = () => {
        const size = this.getConfig().pet?.size || 88;
        this.target.x = 24 + Math.random() * Math.max(40, window.innerWidth - size - 48);
        this.target.y = 40 + Math.random() * Math.max(40, window.innerHeight - size - 80);
      };
      pickNext();
      this.motionTimer = setInterval(pickNext, 4500);
    }

    const step = () => {
      if (this.destroyed) return;
      if (!this.dragging) {
        const dx = this.target.x - this.pos.x;
        const dy = this.target.y - this.pos.y;
        const ease = mode === 'follow' ? 0.045 : 0.015;
        if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
          this.pos.x += dx * ease;
          this.pos.y += dy * ease;
          this.applyCoords();
        }
      }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  applyCoords() {
    if (!this.stageEl) return;
    this.stageEl.style.left = `${Math.round(this.pos.x)}px`;
    this.stageEl.style.top = `${Math.round(this.pos.y)}px`;
  }

  stopMotion() {
    if (this.motionTimer) {
      clearInterval(this.motionTimer);
      this.motionTimer = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.destroyed = true;
    this.stopMotion();
    clearTimeout(this.speechTimer);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.stageEl?.remove();
    this.stageEl = null;
  }
}
