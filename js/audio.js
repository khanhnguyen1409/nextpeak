// --- QUẢN LÝ NHẠC NỀN & PLAYLIST ---
let currentTrackIndex = 0;
let isPlayingMusic = false;

function getActivePlaylist() {
    return (appData.playlist && appData.playlist.length > 0) ? appData.playlist : defaultPlaylist;
}

function toggleMusicPlay() {
    const audio = document.getElementById('bg-music');
    if (!audio) return;

    const playlist = getActivePlaylist();
    if (!audio.getAttribute('src') && playlist.length > 0) {
        audio.src = playlist[currentTrackIndex].url;
    }

    if (isPlayingMusic) {
        audio.pause();
        isPlayingMusic = false;
        updateMusicUI(false);
    } else {
        audio.play().then(() => {
            isPlayingMusic = true;
            updateMusicUI(true);
        }).catch(err => {
            console.error("Lỗi phát nhạc tự động:", err);
            alert("Trình duyệt chặn phát nhạc tự động hoặc link nhạc lỗi.");
        });
    }
}

function playCurrentMusic(index) {
    const playlist = getActivePlaylist();
    if (index !== undefined) {
        currentTrackIndex = index;
    }
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;

    const audio = document.getElementById('bg-music');
    const track = playlist[currentTrackIndex];
    if (!audio || !track) return;

    audio.src = track.url;
    audio.play().then(() => {
        isPlayingMusic = true;
        updateMusicUI(true);
        updatePlaylistDisplay();
    }).catch(err => console.log(err));
}

function nextMusic() {
    const playlist = getActivePlaylist();
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playCurrentMusic();
}

function prevMusic() {
    const playlist = getActivePlaylist();
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playCurrentMusic();
}

function updateMusicUI(isPlaying) {
    const btn = document.getElementById('music-toggle-btn');
    const trackNameEl = document.getElementById('current-track-name');
    const playlist = getActivePlaylist();
    const currentTrack = playlist[currentTrackIndex] || { title: "Background Music" };

    if (trackNameEl) trackNameEl.innerText = currentTrack.title;
    if (btn) {
        btn.innerHTML = isPlaying 
            ? `<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
            : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }
}

function updatePlaylistDisplay() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    const playlist = getActivePlaylist();

    container.innerHTML = playlist.map((track, idx) => `
        <div onclick="playCurrentMusic(${idx})" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${idx === currentTrackIndex ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}">
            <div class="flex items-center space-x-2 truncate">
                <span class="text-xs text-slate-400">${idx + 1}.</span>
                <span class="text-sm truncate">${track.title}</span>
            </div>
            ${idx === currentTrackIndex && isPlayingMusic ? '<span class="flex h-2 w-2 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>' : ''}
        </div>
    `).join('');
}