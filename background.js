let lastFetchTime = 0;
let queryIndex = 0;

const lyricQueries = [
  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, first: 100) {
        lyric
        song
        album
        albumId
      }
    }
  `,

  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, first: 100, skip:100) {
        lyric
        song
        album
        albumId
      }
    }
  `,

  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, last: 100) {
        lyric
        song
        album
        albumId
      }
    }
  `,
];

const albumCoverQuery = `query albumCoverQuery {
  steelyDanAlbums(where: {album_id: 2}) {
    cover {
      url
    }
  }
}`;

async function getSong(queryIndex) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastFetchTime;
  const fetchInterval = 2 * 60 * 1000;
  const randomNumber = Math.floor(Math.random() * 100);
  const query = lyricQueries[queryIndex];

  if (elapsedTime >= fetchInterval) {
    try {
      const response = await fetch(
        "https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clee001xp54cz01t641jw2zv8/master",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();
      const song = data.data.steelyDanLyrics[randomNumber];
      lastFetchTime = currentTime;

      // send song data to content.js
      chrome.runtime.onMessage.addListener(async function (
        request,
        sender,
        sendResponse
      ) {
        if (request.action === "getSong") {
          sendResponse({ song: song });
        }
      });

      // get ready to tweet it
      /* const tweetText = song.lyric;
      const twitterApiUrl = "https://api.twitter.com/1.1/statuses/update.json";
      const twitterHeaders = new Headers({
        Authorization: "Bearer " + twitterAccessToken,
        "Content-Type": "application/x-www-form-urlencoded",
      });
      const twitterBody = new URLSearchParams({
        status: tweetText,
      }); */

      // Return the song
      return song;
    } catch (error) {
      console.log("There was an error:", error);
    }
  } else {
    console.log("Fetch call skipped");
  }
}

async function getCover() {
  try {
    const query = albumCoverQuery;
    const response = await fetch(
      "https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clee001xp54cz01t641jw2zv8/master",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    const albumCover = data.data.steelyDanAlbums[0];
    console.log(albumCover.cover.url);

    // Return the album cover
    return albumCover;
  } catch (error) {
    console.log("There was an error:", error);
  }
}

chrome.alarms.create("steelyDanLyric", {
  when: Date.now() + Math.floor(Math.random() * 1 * 60 * 60 * 1000), // Set a random time for the alarm to trigger within the next hour
});

chrome.alarms.onAlarm.addListener(async () => {
  // Reset the alarm for the next time
  chrome.alarms.create("steelyDanLyric", {
    when: Date.now() + 1 * 60 * 60 * 1000, // Set the alarm to trigger in one hour
  });

  queryIndex = (queryIndex + 1) % 3;
  const newSong = await getSong(queryIndex);
  if (newSong) {
    chrome.notifications.create("steelyDanLyric", {
      type: "basic",
      iconUrl: "img/double-helix-icon128.png",
      title: newSong.lyric,
      message: "",
    });
    const albumCover = await getCover();

    chrome.storage.local.set({ songData: newSong });
    if (albumCover) {
      chrome.storage.local.set({ albumCover: albumCover });
    }
  }
});
