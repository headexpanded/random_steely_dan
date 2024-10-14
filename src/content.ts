// Get the most recent lyric from local storage
// Display it in the popup

document.addEventListener('DOMContentLoaded', function () {
  const lyricSpan = <HTMLSpanElement>document.querySelector('#lyric');
  const songSpan = <HTMLSpanElement>document.querySelector('#song');
  const albumSpan = <HTMLSpanElement>document.querySelector('#album');
  const albumCoverImg = <HTMLImageElement>(
    document.querySelector('#albumCoverImg')
  );

  type songData = {
    lyric: string;
    song_name: string;
    album: string;
    albumId: number;
  }

  // Get locally stored song when the user clicks the extension button

  chrome.storage.local.get('songData', function (result: { songData?: songData }) {
      if (result.songData != null) {
        lyricSpan.textContent = result.songData.lyric;
        songSpan.textContent = `Song: ${result.songData.song_name}`;
        albumSpan.textContent = `Album: ${result.songData.album}`;

        const albumId: number = result.songData.albumId
        albumCoverImg.src = chrome.runtime.getURL(`/img/covers/album_cover_${albumId}.jpg`);
        albumCoverImg.alt = getAlbumAltText(albumId)
      } else {
        lyricSpan.textContent = "Fetching your next Steely Dan lyric...";
        songSpan.textContent = "Please wait for the next update.";
        albumSpan.textContent = "No album info available (yet)...";
        albumCoverImg.src = chrome.runtime.getURL('/img/covers/album_cover_6.jpg');
        albumCoverImg.alt = 'Aja cover art';
      }
    });

    function getAlbumAltText(albumId: number): string {
      switch (albumId) {
        case 1:
          return "Can't Buy A Thrill cover art";
        case 2:
          return 'Countdown To Ecstasy cover art';
        case 3:
          return 'Pretzel Logic cover art';
        case 4:
          return 'Katy Lied cover art';
        case 5:
          return 'The Royal Scam cover art';
        case 6:
          return 'Aja cover art';
        case 7:
          return 'Gaucho cover art';
        case 8:
          return 'Decade cover art';
        case 9:
          return 'Gold cover art';
        default:
          return 'Default cover art';
      }
    }
});
