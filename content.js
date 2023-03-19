// Get the most recently  lyric from local storage
// Display it in the popup

const lyricSpan = document.getElementById("lyric");
const songSpan = document.getElementById("song");
const albumSpan = document.getElementById("album");
const albumCoverImg = document.getElementById("albumCoverImg");

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
  if (!data.albumCover) {
    console.log("Could not retreive album cover art");
  }
});
