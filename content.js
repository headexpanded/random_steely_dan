// Get the most recently displayed lyric from background.js
// Display it in the popup

const lyricSpan = document.getElementById("lyric");
const songSpan = document.getElementById("song");
const albumSpan = document.getElementById("album");
const albumCoverImg = document.getElementById("albumCoverImg");

const cover = document.getElementById("cover");
const noResultText = `There's no lyric to show right now. Check back in an hour or two.`;

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


// Get locally stored song when the user clicks the extension button

chrome.storage.local.get("songData", function (result) {
  if (result.songData) {
    lyricSpan.textContent = `${result.songData.lyric}`;
    songSpan.textContent = `Song: ${result.songData.song}`;
    albumSpan.textContent = `Album: ${result.songData.album}`;
    const albumId = result.songData.albumId;
    switch (albumId) {
      case 1:
        albumCoverImg.src =
          "https://media.graphassets.com/A6KPJzROS16gm8dlzXqQ";
        break;
      case 2:
        albumCoverImg.src =
          "https://media.graphassets.com/ZcEyeqTaSXxd4H9DUD0A";
        break;
      case 3:
        albumCoverImg.src =
          "https://media.graphassets.com/EDTJvljMTMepDVTyToEy";
        break;
      case 4:
        albumCoverImg.src =
          "https://media.graphassets.com/IqTx4rn0RyC7CCP7T9pL";
        break;
      case 5:
        albumCoverImg.src =
          "https://media.graphassets.com/zexJDVXdRMaZaTvg5lig";
        break;
      case 6:
        albumCoverImg.src =
          "https://media.graphassets.com/rH3GtyBaRtm6HKG4vDx6";
        break;
      case 7:
        albumCoverImg.src =
          "https://media.graphassets.com/vGopQO4xQ2WAf43JlJrx";
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
        albumCoverImg.src =
          "https://media.graphassets.com/A6KPJzROS16gm8dlzXqQ";
    }
  } else {
    lyricSpan.textContent = "Lyric goes here.";
  }
});

chrome.storage.local.get("albumCover", function (data) {
  if (data.albumCover) {
    // albumCoverImg.src = `${data.albumCover.cover.url}`;
    console.log(data.albumCover.cover.url);
  } else {
    // albumCoverImg.src = "https://media.graphassets.com/A6KPJzROS16gm8dlzXqQ";
  }
});
