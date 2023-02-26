// Get the most recently displayed lyric from background.js
// Display it in the popup

const lyricSpan = document.getElementById("lyric");
const songSpan = document.getElementById("song");
const albumSpan = document.getElementById("album");

const cover = document.getElementById("cover");
const noResultText = `There's no lyric to show right now. Check back in an hour or two.`;

document.addEventListener("DOMContentLoaded", function () {
  /* chrome.runtime.sendMessage({ action: "getSong" }, function (response) {
    if (response) {
      const song = response.song;
      infoSpan.textContent = `Your most recent random lyric was "${song.lyric}", a line from ${song.song}, which is on ${song.album}`;

      // Store the response in local storage so we can display it in the popup even
      // if the user clicks the button more than once
      chrome.storage.local.set({ songData: song }, function () {
        console.log("Stored song locally");
      });
    } else {
      infoSpan.textContent = noResultText;
      console.log("No response so far");
    }
  }); */
  /* chrome.storage.local.get("songData", function (data) {
    const song = data.songData;
    // Update popup HTML with song data
  }); */
});

// Get locally stored song when the user clicks the extension button again

chrome.storage.local.get("songData", function (result) {
  if (result.songData) {
    lyricSpan.textContent = `${result.songData.lyric}`;
    songSpan.textContent = `Song: ${result.songData.song}`;
    albumSpan.textContent = `Album: ${result.songData.album}`;
    cover.textContent = `${result.songData.albumId}`;
  } else {
    lyricSpan.textContent = "Storage get not working";
    cover.textContent = "This is where the album cover art goes";
  }
});
