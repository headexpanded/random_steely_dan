// Get the most recently displayed lyric from background.js
// Display it in the popup

const infoSpan = document.getElementById("info");
const resultText = `The most recent random lyric was "${song.lyric}", a line from ${song.song}, which is on ${song.album}`;
const noResultText = `There's no lyric to show right now. Check back in an hour or two.`;

chrome.runtime.sendMessage({ action: "getSong" }, function (response) {
  if (response) {
    const song = response.song;

    // Store the response in local storage so we can display it in the popup even
    // if the user clicks the button more than once
    infoSpan.textContent = resultText;
    // localStorage.setItem("lastSong", JSON.stringify(response.song));
    chrome.storage.local.set({ songData: song }, function () {
      console.log("Stored song locally");
    });
  } else {
    infoSpan.textContent = noResultText;
    console.log("No response so far");
  }
});

// Get locally stored song when the user clicks the extension button again

chrome.local?.storage?.get(["songData"], function (result) {
  if (result.songData) {
    infoSpan.textContent = resultText;
  } else {
    infoSpan.textContent = noResultText;
    console.log("No response so far");
  }
});
