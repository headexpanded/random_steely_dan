// Get the most recent lyric from local storage
// Display it in the popup

document.addEventListener("DOMContentLoaded", function () {
  const lyricSpan = <HTMLSpanElement>document.querySelector("#lyric");
  const songSpan = <HTMLSpanElement>document.querySelector("#song");
  const albumSpan = <HTMLSpanElement>document.querySelector("#album");
  const albumCoverImg = <HTMLImageElement>(
    document.querySelector("#albumCoverImg")
  );

  type SongData = {
    lyric: string;
    song_name: string;
    album: string;
    albumId: number;
  }

  // Update the popup with new song data
  const updatePopup = (song: SongData): void => {
    lyricSpan.textContent = song.lyric;
    songSpan.textContent = `Song: ${song.song_name}`;
    albumSpan.textContent = `Album: ${song.album}`;

    const albumId: number = song.albumId;
    albumCoverImg.src = chrome.runtime.getURL(`/img/covers/album_cover_${albumId}.jpg`);
    albumCoverImg.alt = getAlbumAltText(albumId);
  };

  // Get locally stored song when the user clicks the extension button
  chrome.storage.local.get("songData", (result) => {
    if (result.songData) {
      updatePopup(result.songData);
    } else {
      // Display default message if no song data is available
      lyricSpan.textContent = "Your next Steely Dan lyric will appear here soon...";
      songSpan.textContent = "Please wait for the next update.";
      albumSpan.textContent = "No album info available (yet)...";
      albumCoverImg.src = chrome.runtime.getURL("/img/covers/album_cover_6.jpg");
      albumCoverImg.alt = "Aja cover art";
    }
  });

  // Listen for changes in chrome.storage.local and update the popup if songData changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.songData?.newValue) {
      console.log("New song data detected:", changes.songData.newValue); // Debugging log
      updatePopup(changes.songData.newValue);
    }
  });

  function getAlbumAltText(albumId: number): string {
    switch (albumId) {
      case 1:
        return "Can't Buy A Thrill cover art";
      case 2:
        return "Countdown To Ecstasy cover art";
      case 3:
        return "Pretzel Logic cover art";
      case 4:
        return "Katy Lied cover art";
      case 5:
        return "The Royal Scam cover art";
      case 6:
        return "Aja cover art";
      case 7:
        return "Gaucho cover art";
      case 8:
        return "Decade cover art";
      case 9:
        return "Gold cover art";
      default:
        return "Default cover art";
    }
  }
});
