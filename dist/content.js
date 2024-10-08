"use strict";
// Get the most recent lyric from local storage
// Display it in the popup
document.addEventListener('DOMContentLoaded', function () {
    const lyricSpan = document.querySelector('#lyric');
    const songSpan = document.querySelector('#song');
    const albumSpan = document.querySelector('#album');
    const albumCoverImg = (document.querySelector('#albumCoverImg'));
    // Get locally stored song when the user clicks the extension button
    chrome.storage.local.get('songData', function (result) {
        if (result.songData != null) {
            lyricSpan.textContent = `${result.songData?.lyric}`;
            songSpan.textContent = `Song: ${result.songData?.song_name}`;
            albumSpan.textContent = `Album: ${result.songData?.album}`;
            const albumId = result.songData?.albumId;
            // get the album's cover art
            switch (albumId) {
                case 1:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_1.jpg');
                    albumCoverImg.alt = "Can't Buy A Thrill cover art";
                    break;
                case 2:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_2.jpg');
                    albumCoverImg.alt = 'Countdown To Ecstasy cover art';
                    break;
                case 3:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_3.jpg');
                    albumCoverImg.alt = 'Pretzel Logic cover art';
                    break;
                case 4:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_4.jpg');
                    albumCoverImg.alt = 'Katy Lied cover art';
                    break;
                case 5:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_5.jpg');
                    albumCoverImg.alt = 'The Royal Scam cover art';
                    break;
                case 6:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_6.jpg');
                    albumCoverImg.alt = 'Aja cover art';
                    break;
                case 7:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_7.jpg');
                    albumCoverImg.alt = 'Gaucho cover art';
                    break;
                case 8:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_8.jpg');
                    albumCoverImg.alt = 'Decade cover art';
                    break;
                case 9:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_9.jpg');
                    albumCoverImg.alt = 'Gold cover art';
                    break;
                default:
                    albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_1.jpg');
                    albumCoverImg.alt = 'Default cover art';
            }
        }
        else {
            lyricSpan.textContent = "Shine up the battle apple.";
            songSpan.textContent = "Josie";
            albumSpan.textContent = "Aja";
            albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_6.jpg');
            albumCoverImg.alt = 'Aja cover art';
        }
    });
});
