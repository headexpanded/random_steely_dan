// Get the most recently displayed lyric from background.js
// Display it in the popup

chrome.runtime.sendMessage({ action: "getSong" }, function (response) {
  if (response) {
    // Store the response in local storage so we can display it in the popup even
    // if the user clicks the button more than once
    localStorage.setItem("lastSong", JSON.stringify(response.song));
    const infoSpan = document.getElementById("info");
    infoSpan.textContent = `The most recent random lyric was "${response.song.lyric}", a line from ${response.song.song} which is on ${resonse.song.album}`;
  } else {
    console.log("No response so far");
  }
});

// Get locally stored song when the user clicks the extension button again
document.getElementById("button").addEventListener("click", function () {
  const lastSong = JSON.parse(localStorage.getItem("lastSong"));

  if (lastSong) {
    const infoSpan = document.getElementById("info");
    infoSpan.textContent = `The most recent random lyric was "${lastSong.lyric}", a line from ${lastSong.song} which is on ${lastSong.album}`;
  } else {
    console.log("No last song stored");
  }
});
