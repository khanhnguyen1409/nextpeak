// --- TRUNG TÂM QUẢN TRỊ (ADMIN CENTER) ---
function toggleAdminAccordion(sectionId) {
    const content = document.getElementById(`admin-section-${sectionId}`);
    if (!content) return;
    content.classList.toggle('hidden');
}

function renderAdminCenter() {
    // Kiểm tra quyền Admin (Ví dụ: member_1 hoặc tài khoản cấu hình đặc biệt)
    if (loggedInUserId !== appData.members[0]?.id && loggedInUserId !== 'member_1') {
        const adminTabBtn = document.getElementById('admin-tab-btn');
        if (adminTabBtn) adminTabBtn.classList.add('hidden');
        return;
    }

    renderPendingMembersList();
    renderSystemConfigForm();
}

function renderPendingMembersList() {
    const container = document.getElementById('pending-members-container');
    if (!container) return;

    const list = appData.pendingMembers || [];
    if (list.length === 0) {
        container.innerHTML = `<p class="text-sm text-slate-400 italic">Không có yêu cầu đăng ký nào đang chờ duyệt.</p>`;
        return;
    }

    container.innerHTML = list.map((m, idx) => `
        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                    ${m.avatar ? `<img src="${m.avatar}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center font-bold text-slate-600">${m.name.charAt(0)}</div>`}
                </div>
                <div>
                    <h4 class="font-bold text-sm">${m.name}</h4>
                    <span class="text-xs text-slate-500">PIN: ${m.pin || 'Không có'}</span>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="approveMember(${idx})" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">Duyệt</button>
                <button onclick="rejectMember(${idx})" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold">Từ chối</button>
            </div>
        </div>
    `).join('');
}

function approveMember(index) {
    const member = appData.pendingMembers.splice(index, 1)[0];
    appData.members.push(member);

    dbRef.set(appData).then(() => {
        alert(`Đã duyệt thành viên ${member.name}!`);
        renderAdminCenter();
        renderUserSelect();
    });
}

function rejectMember(index) {
    appData.pendingMembers.splice(index, 1);
    dbRef.child('pendingMembers').set(appData.pendingMembers).then(() => {
        alert("Đã từ chối yêu cầu đăng ký.");
        renderAdminCenter();
    });
}

function saveSystemConfig() {
    const appTitle = document.getElementById('config-app-title').value.trim();
    const penaltyFund = document.getElementById('config-penalty-fund').value.trim();

    appData.systemConfig = appData.systemConfig || {};
    if (appTitle) appData.systemConfig.title = appTitle;
    if (penaltyFund) appData.systemConfig.penaltyFund = penaltyFund;

    dbRef.child('systemConfig').set(appData.systemConfig).then(() => {
        alert(currentLang === 'vi' ? "Cập nhật cấu hình thành công!" : "System configuration updated!");
    });
}

function handleResetTestData() {
    const confirmDanger = confirm(currentLang === 'vi' ? 
        "Hành động này sẽ khôi phục lại dữ liệu gốc của hệ thống. Bạn có chắc chắn không?" : 
        "This will reset all test data. Are you sure?");
    if (confirmDanger) {
        dbRef.set({
            members: defaultMembers,
            pendingMembers: [],
            sharedChallenges: [],
            personalHabits: { 'member_1': [] },
            systemConfig: defaultSystemConfig,
            playlist: defaultPlaylist,
            slogansPool: defaultSlogans,
            hintsPool: defaultHints
        }).then(() => {
            alert("Đã thiết lập lại dữ liệu thành công!");
            location.reload();
        });
    }
}
// --- KÍCH HOẠT ỨNG DỤNG KHI TẢI XONG TRANG ---
document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra xem user đã đăng nhập trước đó chưa
    const savedUser = localStorage.getItem('nextPeak_loggedInUser');
    if (savedUser) {
        loggedInUserId = savedUser;
        // Nếu đã đăng nhập, khởi động app chính
        if (typeof initAppAfterLogin === 'function') {
            initAppAfterLogin();
        }
    } else {
        // Nếu chưa, hiển thị màn hình chọn tài khoản đăng nhập
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.remove('hidden');
        if (typeof renderUserSelect === 'function') {
            renderUserSelect();
        }
    }
});
