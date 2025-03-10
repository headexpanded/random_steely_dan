"use strict";
// Get the most recent lyric from local storage
// Display it in the popup
document.addEventListener("DOMContentLoaded", function () {
    const lyricSpan = document.querySelector("#lyric");
    const songSpan = document.querySelector("#song");
    const albumSpan = document.querySelector("#album");
    const albumCoverImg = (document.querySelector("#albumCoverImg"));
    // Update the popup with new song data
    const updatePopup = (song) => {
        lyricSpan.textContent = song.lyric;
        songSpan.textContent = `Song: ${song.song_title}`;
        albumSpan.textContent = `Album: ${song.album_title}`;
        albumCoverImg.src = song.album_image;
        albumCoverImg.alt = "Steely Dan album cover art";
    };
    // Get locally stored song when the user clicks the extension button
    chrome.storage.local.get("song", (result) => {
        if (result.song) {
            updatePopup(result.song);
        }
        else {
            // Display default message if no song data is available
            lyricSpan.textContent = "Your next Steely Dan lyric will appear here soon...";
            songSpan.textContent = "Please wait for the next update.";
            albumSpan.textContent = "No album info available (yet)...";
            albumCoverImg.src = chrome.runtime.getURL("/img/covers/album_cover_6.jpg");
            albumCoverImg.alt = "Aja cover art";
        }
    });
    // Listen for changes in chrome.storage.local and update the popup if song changes
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.song?.newValue) {
            console.log("New song detected:", changes.song.newValue); // Debugging log
            updatePopup(changes.song.newValue);
        }
    });
});
