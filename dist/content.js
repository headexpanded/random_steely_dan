"use strict";
// Get the most recent lyric from local storage
// Display it in the popup
Object.defineProperty(exports, "__esModule", { value: true });
// Constants
const CONFIG = {
    DEBOUNCE_DELAY: 250, // ms
    ELEMENT_IDS: {
        lyric: "#lyric",
        song: "#song",
        album: "#album",
        albumCover: "#albumCoverImg"
    }
};
const DEFAULT_STATE = {
    lyric: "Your next Steely Dan lyric will appear here soon...",
    song: "Please wait for the next update.",
    album: "No album info available (yet)...",
    albumCover: {
        src: "/img/covers/album_cover_6.jpg",
        alt: "Aja cover art"
    }
};
// Utility Functions
function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            func(...args);
            timeout = null;
        }, wait);
    };
}
// Helper Functions
function getElements() {
    try {
        const lyric = document.querySelector(CONFIG.ELEMENT_IDS.lyric);
        const song = document.querySelector(CONFIG.ELEMENT_IDS.song);
        const album = document.querySelector(CONFIG.ELEMENT_IDS.album);
        const albumCover = document.querySelector(CONFIG.ELEMENT_IDS.albumCover);
        // Verify all elements exist
        if (!lyric || !song || !album || !albumCover) {
            throw new Error("Required DOM elements not found");
        }
        return {
            lyric,
            song,
            album,
            albumCover
        };
    }
    catch (error) {
        console.error("Error getting DOM elements:", error);
        return null;
    }
}
function updatePopup(elements, song) {
    try {
        elements.lyric.textContent = song.lyric;
        elements.song.textContent = `Song: ${song.song_title}`;
        elements.album.textContent = `Album: ${song.album_title}`;
        // Only update image if it's different
        if (elements.albumCover.src !== song.album_image) {
            elements.albumCover.src = song.album_image;
            elements.albumCover.alt = "Steely Dan album cover art";
        }
    }
    catch (error) {
        console.error("Error updating popup:", error);
        setDefaultState(elements);
    }
}
function setDefaultState(elements) {
    elements.lyric.textContent = DEFAULT_STATE.lyric;
    elements.song.textContent = DEFAULT_STATE.song;
    elements.album.textContent = DEFAULT_STATE.album;
    const defaultImageUrl = chrome.runtime.getURL(DEFAULT_STATE.albumCover.src);
    if (elements.albumCover.src !== defaultImageUrl) {
        elements.albumCover.src = defaultImageUrl;
        elements.albumCover.alt = DEFAULT_STATE.albumCover.alt;
    }
}
// Main
document.addEventListener("DOMContentLoaded", () => {
    const elements = getElements();
    if (!elements) {
        console.error("Failed to initialize popup: DOM elements not found");
        return;
    }
    // Get locally stored song when the user clicks the extension button
    chrome.storage.local.get("song", (result) => {
        if (result.song) {
            updatePopup(elements, result.song);
        }
        else {
            setDefaultState(elements);
        }
    });
    // Create debounced update function
    const debouncedUpdate = debounce((song) => {
        updatePopup(elements, song);
    }, CONFIG.DEBOUNCE_DELAY);
    // Listen for changes in chrome.storage.local and update the popup if song changes
    chrome.storage.onChanged.addListener((changes, area) => {
        var _a;
        if (area === "local" && ((_a = changes.song) === null || _a === void 0 ? void 0 : _a.newValue)) {
            debouncedUpdate(changes.song.newValue);
        }
    });
});
