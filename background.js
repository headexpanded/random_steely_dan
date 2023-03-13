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

async function getSong(queryIndex) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastFetchTime;
  const fetchInterval = 8 * 60 * 1000;
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

      // Return the song
      return song;
    } catch (error) {
      console.log("There was an error:", error);
    }
  } else {
    console.log("Fetch call skipped");
  }
}

chrome.alarms.create("steelyDanLyric", {
  when: Date.now() + Math.floor(Math.random() * 8 * 60 * 60 * 1000), // Set a random time for the alarm to trigger within the next hour
});

chrome.alarms.onAlarm.addListener(async () => {
  // Reset the alarm for the next time
  chrome.alarms.create("steelyDanLyric", {
    when: Date.now() + 8 * 60 * 60 * 1000, // Set the alarm to trigger in one hour
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
    chrome.storage.local.set({ songData: newSong });
  }
});
