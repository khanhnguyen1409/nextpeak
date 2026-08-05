// js/main.js - File điều phối toàn bộ vòng đời ứng dụng
let loggedInUserId = localStorage.getItem('nextPeak_loggedInUser') || null;

// Hàm khởi tạo sau khi đăng nhập thành công
function initAppAfterLogin() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.add('hidden');
    
    // Lắng nghe dữ liệu Firebase
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appData = Object.assign(appData, data);
        }
        // Kiểm tra và render giao diện nếu hàm tồn tại
        if (typeof renderCurrentView === 'function') {
            renderCurrentView();
        } else {
            // Fallback nếu chưa có hàm render chính
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                        <h2 class="text-xl font-bold text-indigo-600 mb-2">Đăng nhập thành công!</h2>
                        <p class="text-sm text-slate-500 mb-4">Hệ thống đã kết nối dữ liệu Firebase.</p>
                        <button onclick="logout()" class="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold">Đăng xuất</button>
                    </div>
                `;
            }
        }
    });
}

// Tự động kích hoạt khi trang web tải xong
document.addEventListener("DOMContentLoaded", function() {
    // Lắng nghe dữ liệu ban đầu
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appData = Object.assign(appData, data);
        }
        
        // Kiểm tra trạng thái đăng nhập
        if (loggedInUserId) {
            initAppAfterLogin();
        } else {
            if (typeof renderUserSelect === 'function') {
                renderUserSelect();
            }
            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.classList.remove('hidden');
        }
    });
});
