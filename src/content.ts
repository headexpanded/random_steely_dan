// Get the most recent lyric from local storage
// Display it in the popup

document.addEventListener("DOMContentLoaded", () => {
  const lyric = document.querySelector<HTMLSpanElement>("#lyric");
  const song = document.querySelector<HTMLSpanElement>("#song");
  const album = document.querySelector<HTMLSpanElement>("#album");
  const albumCover = document.querySelector<HTMLImageElement>("#albumCoverImg");

  if (!lyric || !song || !album || !albumCover) {
    console.error("Required DOM elements not found");
    return;
  }

  // Get locally stored song when the user clicks the extension button
  chrome.storage.local.get("song", (result) => {
    if (result.song) {
      lyric.textContent = result.song.lyric;
      song.textContent = `Song: ${result.song.song_title}`;
      album.textContent = `Album: ${result.song.album_title}`;
      albumCover.src = result.song.album_image;
      albumCover.alt = "Steely Dan album cover art";
    } else {
      lyric.textContent = "Your next Steely Dan lyric will appear here soon...";
      song.textContent = "Please wait for the next update.";
      album.textContent = "No album info available (yet)...";
      albumCover.src = chrome.runtime.getURL("/img/covers/album_cover_6.jpg");
      albumCover.alt = "Aja cover art";
    }
  });

  // Listen for changes in chrome.storage.local and update the popup if song changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.song?.newValue) {
      lyric.textContent = changes.song.newValue.lyric;
      song.textContent = `Song: ${changes.song.newValue.song_title}`;
      album.textContent = `Album: ${changes.song.newValue.album_title}`;
      albumCover.src = changes.song.newValue.album_image;
      albumCover.alt = "Steely Dan album cover art";
    }
  });
});
