// Get the most recently displayed lyric from background.js
// Display it in the popup

chrome.runtime.sendMessage({ action: "getSong" }, function (response) {
  const infoSpan = document.getElementById("info");
  if (response) {
    const song = response.song;
    const text = `The most recent random lyric was "${song.lyric}", a line from ${song.song} which is on ${song.album}`;
    // Store the response in local storage so we can display it in the popup even
    // if the user clicks the button more than once
    infoSpan.textContent = text;
    // localStorage.setItem("lastSong", JSON.stringify(response.song));
    chrome.storage.local.set({ songData: song }, function () {
      console.log("Stored song locally");
    });
  } else {
    infoSpan.textContent = `There's no lyric to show right now. Check back in an hour or two.`;
    console.log("No response so far");
  }
});

// Get locally stored song when the user clicks the extension button again

chrome.local.storage.get(["songData"], function (result) {
  if (result.songData) {
    const infoSpan = document.getElementById("info");
    const text = `The most recent random lyric was "${song.lyric}", a line from ${song.song} which is on ${song.album}`;
    infoSpan.textContent = text;
  } else {
    infoSpan.textContent = `There's no lyric to show right now. Check back in an hour or two.`;
    console.log("No response so far");
  }
});

/* document.getElementById("button").addEventListener("click", function () {
  const lastSong = JSON.parse(localStorage.getItem("lastSong"));

  if (lastSong) {
    const infoSpan = document.getElementById("info");
    infoSpan.textContent = `The most recent random lyric was "${lastSong.lyric}", a line from ${lastSong.song} which is on ${lastSong.album}`;
  } else {
    console.log("No last song stored");
  }
}); */
