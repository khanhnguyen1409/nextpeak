// --- TIỆN ÍCH NÉN ẢNH (Base64) ---
function compressImage(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- ĐIỀU HƯỚNG TAB & BỘ LỌC ---
let currentTab = 'group-challenge';
let currentFilter = 'all';

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.app-tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('border-indigo-600', 'text-indigo-600', 'font-bold'));
    const activeBtn = document.getElementById(`btn-tab-${tabId}`);
    if (activeBtn) activeBtn.classList.add('border-indigo-600', 'text-indigo-600', 'font-bold');

    renderCurrentView();
}

function setFilter(filterType) {
    currentFilter = filterType;
    renderCurrentView();
}

function renderCurrentView() {
    if (currentTab === 'group-challenge') {
        renderGroupChallenges();
    } else if (currentTab === 'personal-habit') {
        renderPersonalHabits();
    } else if (currentTab === 'rules-penalties') {
        renderRulesAndPenalties();
    }
}

// --- LOGIC THỬ THÁCH NHÓM & CHECK-IN ---
let activeChallengeId = null;
let activeCheckInDay = null;

function openDayModal(challengeId, dayIndex) {
    activeChallengeId = challengeId;
    activeCheckInDay = dayIndex;

    const challenge = appData.sharedChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    challenge.progress = challenge.progress || {};
    challenge.progress[loggedInUserId] = challenge.progress[loggedInUserId] || {};
    const dayData = challenge.progress[loggedInUserId][dayIndex] || { status: 'none', note: '', image: '' };

    document.getElementById('day-modal-title').innerText = `Ngày ${dayIndex + 1} - ${challenge.title}`;
    document.getElementById('day-note-input').value = dayData.note || '';
    document.getElementById('day-image-input').value = dayData.image || '';
    
    const previewContainer = document.getElementById('day-image-preview');
    if (dayData.image) {
        previewContainer.innerHTML = `<img src="${dayData.image}" class="h-32 object-cover rounded-lg border">`;
        previewContainer.classList.remove('hidden');
    } else {
        previewContainer.innerHTML = '';
        previewContainer.classList.add('hidden');
    }

    document.getElementById('day-modal').classList.remove('hidden');
}

function closeDayModal() {
    document.getElementById('day-modal').classList.add('hidden');
    activeChallengeId = null;
    activeCheckInDay = null;
}

function setDayStatus(status) {
    if (!activeChallengeId || activeCheckInDay === null) return;

    const challenge = appData.sharedChallenges.find(c => c.id === activeChallengeId);
    if (!challenge) return;

    challenge.progress = challenge.progress || {};
    challenge.progress[loggedInUserId] = challenge.progress[loggedInUserId] || {};
    
    const note = document.getElementById('day-note-input').value.trim();
    const image = document.getElementById('day-image-input').value.trim();

    challenge.progress[loggedInUserId][activeCheckInDay] = {
        status: status, // 'completed', 'failed', 'excused'
        note: note,
        image: image,
        updatedAt: new Date().toISOString()
    };

    dbRef.child('sharedChallenges').set(appData.sharedChallenges).then(() => {
        closeDayModal();
        renderGroupChallenges();
    });
}

function previewDayImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    compressImage(file, 800, 800, 0.75, (base64) => {
        document.getElementById('day-image-input').value = base64;
        const previewContainer = document.getElementById('day-image-preview');
        previewContainer.innerHTML = `<img src="${base64}" class="h-32 object-cover rounded-lg border">`;
        previewContainer.classList.remove('hidden');
    });
}

function removeDayImage() {
    document.getElementById('day-image-input').value = '';
    const previewContainer = document.getElementById('day-image-preview');
    previewContainer.innerHTML = '';
    previewContainer.classList.add('hidden');
}

// --- CHỤP ẢNH MÀN HÌNH THỬ THÁCH (html2canvas) ---
function captureChallengeCard(challengeId) {
    const cardElement = document.getElementById(`challenge-card-${challengeId}`);
    if (!cardElement) return;

    // Hiệu ứng thông báo đang chụp
    alert(currentLang === 'vi' ? "Đang tạo ảnh chụp màn hình, vui lòng đợi trong giây lát..." : "Generating screenshot, please wait...");

    html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    }).then(canvas => {
        const imageURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `challenge-${challengeId}-${Date.now()}.png`;
        link.click();
    }).catch(err => {
        console.error(err);
        alert("Không thể chụp ảnh màn hình do lỗi bảo mật CORS của hình ảnh bên ngoài.");
    });
}