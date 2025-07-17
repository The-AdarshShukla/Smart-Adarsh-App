function initMusicPlayer() {
    const audio = document.getElementById("audio");
    const nowPlaying = document.getElementById("now-playing");
    const songListEl = document.getElementById("song-list");
    const musicIcon = document.getElementById("music-icon");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");

    const songs = [
        { title: "Lag Jaa Gale", file: "music/song1.mp3" },
        { title: "Pal Pal Dil Ke Paas", file: "music/song2.mp3" },
        { title: "ham tumhare hai", file: "Hum Tumhare Hain Sanaam.mp3" },
        { title: "Yeh Dosti", file: "music/song3.mp3" },
        { title: "rang barse", file: "music/song4.mp3" },
        { title: "hanuman chalisha", file: "music/song5.mp3" },
        { title: "yashoda ka nandlala", file: "music/song6.mp3" },
        { title: "zingat", file: "music/song7.mp3" },
        { title: "rab kare", file: "music/song8.mp3" },
        { title: "sawan aaya bdaal chhaye", file: "music/song9.mp3" }
    ];

    let currentIndex = loadLastPlayedIndex() || 0;
    let isPlaying = false;

    // === Load Song by Index ===
    function loadSong(index) {
        // Ensure index is within bounds
        currentIndex = Math.max(0, Math.min(index, songs.length - 1));
        
        const song = songs[currentIndex];
        audio.src = song.file;
        updateNowPlaying(song.title);
        highlightActiveSong(currentIndex);
        saveLastPlayedIndex(currentIndex);
        
        // Auto-play if already playing
        if (isPlaying) {
            audio.play().catch(e => console.log("Auto-play prevented:", e));
        }
    }

    // === Highlight Song in Sidebar ===
    function highlightActiveSong(index) {
        const items = document.querySelectorAll(".song-item");
        items.forEach((item, i) => {
            item.classList.toggle("active", i === index);
            // Scroll into view if active
            if (i === index) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // === Save last played index to localStorage ===
    function saveLastPlayedIndex(index) {
        localStorage.setItem("lastPlayedIndex", index);
    }

    function loadLastPlayedIndex() {
        const index = localStorage.getItem("lastPlayedIndex");
        return index !== null ? parseInt(index) : null;
    }

    // Update now playing display
    function updateNowPlaying(title) {
        nowPlaying.innerHTML = `Now Playing: <strong>${title}</strong>`;
        localStorage.setItem('lastPlayingSong', title);
    }

    // Update music icon based on theme
    function updateMusicIcon() {
    const icon = document.getElementById("music-icon");
    if (!icon) return;

    const isDarkMode = document.body.classList.contains("dark-mode");
    
    // Clear existing classes
    icon.classList.remove("fa-music", "fa-headphones");
    
    // Add appropriate class based on theme
    icon.classList.add(isDarkMode ? "fa-headphones" : "fa-music");
    
    // Update color if needed (optional)
    icon.style.color = isDarkMode ? "#ffffff" : "#4361ee";
}

    // Update play/pause button
    function updatePlayPauseButton() {
        if (playPauseBtn) {
            playPauseBtn.innerHTML = isPlaying ? 
                '<i class="fas fa-pause"></i>' : 
                '<i class="fas fa-play"></i>';
        }
    }

    // === Controls ===
    function playPause() {
    const icon = document.getElementById('play-pause-icon');

    if (audio.paused) {
        audio.play()
            .then(() => {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            })
            .catch(e => console.log("Play error:", e));
    } else {
        audio.pause();
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

    function nextSong() {
        currentIndex = (currentIndex + 1) % songs.length;
        loadSong(currentIndex);
    }

    function prevSong() {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        loadSong(currentIndex);
    }

    // === Event Listeners ===
    audio.addEventListener("play", () => {
        isPlaying = true;
        updatePlayPauseButton();
    });

    audio.addEventListener("pause", () => {
        isPlaying = false;
        updatePlayPauseButton();
    });

    audio.addEventListener("ended", nextSong);

    // === Initialize ===
    function setupEventListeners() {
        // Song list items
        document.querySelectorAll(".song-item").forEach((item, index) => {
            item.addEventListener("click", () => {
                currentIndex = index;
                loadSong(currentIndex);
                playPause();
            });
        });

        // Control buttons
        if (playPauseBtn) playPauseBtn.addEventListener("click", playPause);
        if (nextBtn) nextBtn.addEventListener("click", nextSong);
        if (prevBtn) prevBtn.addEventListener("click", prevSong);
    }

    function init() {
        // Load last playing song if available
        const lastSong = localStorage.getItem('lastPlayingSong');
        if (lastSong) {
            const songIndex = songs.findIndex(song => song.title === lastSong);
            if (songIndex !== -1) currentIndex = songIndex;
        }
        
        setupEventListeners();
        loadSong(currentIndex);
        updateMusicIcon();
        updatePlayPauseButton();
        
        // Theme change listener
        document.addEventListener('themeChanged', () => {
            updateMusicIcon();
            highlightActiveSong(currentIndex);
        });

        document.addEventListener("DOMContentLoaded", () => {
    updateMusicIcon();
});

    }

    // Make controls available globally if needed
    window.playPause = playPause;
    window.nextSong = nextSong;
    window.prevSong = prevSong;

    init();
}