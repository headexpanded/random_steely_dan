"use strict";
// Get the most recently  lyric from local storage
// Display it in the popup
const lyricSpan = document.getElementById("lyric");
const songSpan = document.getElementById("song");
const albumSpan = document.getElementById("album");
const albumCoverImg = (document.getElementById("albumCoverImg"));
const cover = document.getElementById("cover");
const noResultText = `There's no lyric to show right now. Check back in an hour or two.`;
// Get locally stored song when the user clicks the extension button
chrome.storage.local.get("songData", function (result) {
    if (result.songData) {
        lyricSpan.textContent = `${result.songData.lyric}`;
        songSpan.textContent = `Song: ${result.songData.song}`;
        albumSpan.textContent = `Album: ${result.songData.album}`;
        const albumId = result.songData.albumId;
        // get the album's cover art
        switch (albumId) {
            case 1:
                albumCoverImg.src = "/img/covers/album_cover_1.jpg";
                albumCoverImg.alt = "Can't Buy A Thrill cover art";
                break;
            case 2:
                albumCoverImg.src = "/img/covers/album_cover_2.jpg";
                albumCoverImg.alt = "Countdown To Ecstasy cover art";
                break;
            case 3:
                albumCoverImg.src = "/img/covers/album_cover_3.jpg";
                albumCoverImg.alt = "Pretzel Logic cover art";
                break;
            case 4:
                albumCoverImg.src = "/img/covers/album_cover_4.jpg";
                albumCoverImg.alt = "Katy Lied cover art";
                break;
            case 5:
                albumCoverImg.src = "/img/covers/album_cover_5.jpg";
                albumCoverImg.alt = "The Royal Scam cover art";
                break;
            case 6:
                albumCoverImg.src = "/img/covers/album_cover_6.jpg";
                albumCoverImg.alt = "Aja cover art";
                break;
            case 7:
                albumCoverImg.src = "/img/covers/album_cover_7.jpg";
                albumCoverImg.alt = "Gaucho cover art";
                break;
            case 8:
                albumCoverImg.src =
                    "https://media.graphassets.com/DdHAZfEwQqW0gUUKIC7f";
                break;
            case 9:
                albumCoverImg.src =
                    "https://media.graphassets.com/Uk751ZwLTSk0PCjSZr7M";
                break;
            default:
                albumCoverImg.src = "/img/covers/album_cover_1.jpg";
        }
    }
    else {
        lyricSpan.textContent = "Lyric goes here.";
    }
});
