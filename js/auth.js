// --- QUẢN LÝ XÁC THỰC & ĐĂNG NHẬP ---
let selectedLoginUser = null;
let currentPinInput = "";

function renderUserSelect() {
    const grid = document.getElementById('user-select-grid');
    if (!grid) return;
    grid.innerHTML = appData.members.map(m => `
        <button onclick="selectUserForLogin('${m.id}')" class="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-sm group">
            <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2 border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500">
                ${m.avatar ? `<img src="${m.avatar}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500">${m.name.charAt(0)}</div>`}
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-full text-center">${m.name}</span>
        </button>
    `).join('');
}

function selectUserForLogin(userId) {
    selectedLoginUser = appData.members.find(m => m.id === userId);
    if (!selectedLoginUser) return;

    document.getElementById('step-select-user').classList.add('hidden');
    
    // Nếu thành viên chưa thiết lập PIN, chuyển thẳng vào ứng dụng hoặc yêu cầu tạo PIN tùy ý
    if (!selectedLoginUser.pin) {
        finishLogin(selectedLoginUser.id);
        return;
    }

    // Hiển thị bước nhập PIN
    document.getElementById('step-enter-pin').classList.remove('hidden');
    document.getElementById('pin-user-name').innerText = selectedLoginUser.name;
    const avtContainer = document.getElementById('pin-user-avatar');
    avtContainer.innerHTML = selectedLoginUser.avatar 
        ? `<img src="${selectedLoginUser.avatar}" class="w-full h-full object-cover">` 
        : `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xl">${selectedLoginUser.name.charAt(0)}</div>`;
    
    currentPinInput = "";
    updatePinDots();
}

function handleLoginBack() {
    document.getElementById('step-enter-pin').classList.add('hidden');
    document.getElementById('step-select-user').classList.remove('hidden');
    selectedLoginUser = null;
    currentPinInput = "";
}

function appendPin(num) {
    if (currentPinInput.length < 6) {
        currentPinInput += num;
        updatePinDots();
        if (currentPinInput.length === 4 || currentPinInput.length === 6) {
            // Tự động xác thực khi đủ số PIN tiêu chuẩn
            setTimeout(verifyPin, 100);
        }
    }
}

function clearPin() {
    currentPinInput = currentPinInput.slice(0, -1);
    updatePinDots();
}

function updatePinDots() {
    for (let i = 1; i <= 6; i++) {
        const dot = document.getElementById(`pin-dot-${i}`);
        if (dot) {
            if (i <= currentPinInput.length) {
                dot.classList.add('bg-indigo-600', 'border-indigo-600');
            } else {
                dot.classList.remove('bg-indigo-600', 'border-indigo-600');
            }
        }
    }
}

function verifyPin() {
    if (!selectedLoginUser) return;
    
    if (currentPinInput === selectedLoginUser.pin) {
        finishLogin(selectedLoginUser.id);
    } else {
        alert(currentLang === 'vi' ? "Mã PIN không chính xác!" : "Incorrect PIN!");
        currentPinInput = "";
        updatePinDots();
    }
}

function handleForgotPin() {
    if (!selectedLoginUser) return;
    const confirmReset = confirm(currentLang === 'vi' ? 
        `Bạn có muốn đặt lại mã PIN cho tài khoản ${selectedLoginUser.name}? Mã PIN mới sẽ được xóa trống để bạn tạo lại.` : 
        `Do you want to reset PIN for ${selectedLoginUser.name}?`);
    if (confirmReset) {
        selectedLoginUser.pin = "";
        dbRef.child('members').set(appData.members).then(() => {
            alert(currentLang === 'vi' ? "Đã xóa mã PIN cũ. Vui lòng đăng nhập lại." : "PIN cleared. Please login again.");
            finishLogin(selectedLoginUser.id);
        });
    }
}

function finishLogin(userId) {
    localStorage.setItem('nextPeak_loggedInUser', userId);
    loggedInUserId = userId;
    document.getElementById('auth-modal').classList.add('hidden');
    initAppAfterLogin();
}

function logout() {
    localStorage.removeItem('nextPeak_loggedInUser');
    location.reload();
}

// --- ĐĂNG KÝ THÀNH VIÊN MỚI ---
function openRegisterView() {
    document.getElementById('step-select-user').classList.add('hidden');
    document.getElementById('step-register-user').classList.remove('hidden');
}

function closeRegisterView() {
    document.getElementById('step-register-user').classList.add('hidden');
    document.getElementById('step-select-user').classList.remove('hidden');
}

function submitNewRegistration() {
    const nameInput = document.getElementById('reg-name').value.trim();
    const pinInput = document.getElementById('reg-pin').value.trim();
    const avatarInput = document.getElementById('reg-avatar').value.trim();

    if (!nameInput) {
        alert(currentLang === 'vi' ? "Vui lòng nhập tên của bạn!" : "Please enter your name!");
        return;
    }

    const newId = 'member_' + Date.now();
    const newMember = {
        id: newId,
        name: nameInput,
        pin: pinInput,
        avatar: avatarInput,
        pinHistory: []
    };

    appData.pendingMembers = appData.pendingMembers || [];
    appData.pendingMembers.push(newMember);

    dbRef.child('pendingMembers').set(appData.pendingMembers).then(() => {
        alert(currentLang === 'vi' ? "Đăng ký thành công! Vui lòng chờ Quản trị viên phê duyệt để tham gia." : "Registration successful! Please wait for admin approval.");
        closeRegisterView();
    }).catch(err => {
        console.error(err);
        alert("Lỗi kết nối Firebase!");
    });
}

// --- QUẢN LÝ HỒ SƠ CÁ NHÂN (PROFILE) ---
function openProfileModal() {
    const user = appData.members.find(m => m.id === loggedInUserId);
    if (!user) return;

    document.getElementById('profile-name-input').value = user.name || '';
    document.getElementById('profile-avatar-input').value = user.avatar || '';
    document.getElementById('profile-pin-input').value = user.pin || '';
    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

function previewProfileAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Nén ảnh đại diện trước khi lưu base64
    compressImage(file, 300, 300, 0.7, (base64String) => {
        document.getElementById('profile-avatar-input').value = base64String;
    });
}

function saveProfileChanges() {
    const user = appData.members.find(m => m.id === loggedInUserId);
    if (!user) return;

    user.name = document.getElementById('profile-name-input').value.trim() || user.name;
    user.avatar = document.getElementById('profile-avatar-input').value.trim();
    const newPin = document.getElementById('profile-pin-input').value.trim();
    if (newPin) user.pin = newPin;

    dbRef.child('members').set(appData.members).then(() => {
        alert(currentLang === 'vi' ? "Cập nhật hồ sơ thành công!" : "Profile updated successfully!");
        closeProfileModal();
        renderHeaderUserInfo();
    });
}