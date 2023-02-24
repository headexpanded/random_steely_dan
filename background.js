let lastFetchTime = 0;

const queries = [
  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, first: 100) {
        lyric
      }
    }
  `,

  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, last: 100) {
        lyric
      }
    }
  `,
];
async function getLyric(queryIndex) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastFetchTime;
  const fetchInterval = 2 * 60 * 1000;
  const randomNumber = Math.floor(Math.random() * 100);
  console.log("getLyric called");
  const query = queries[queryIndex];

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
      console.log(randomNumber);
      const lyric = data.data.steelyDanLyrics[randomNumber].lyric;
      lastFetchTime = currentTime;
      // Return the lyric
      return lyric;
    } catch (error) {
      console.log("There was an error:", error);
    }
  } else {
    console.log("Fetch call skipped");
  }
}

// Create the alarm for the next notification
chrome.alarms.create("steelyDanLyric", {
  periodInMinutes: 2,
});

let queryIndex = 0;
chrome.alarms.onAlarm.addListener(async () => {
  const newLyric = await getLyric(queryIndex);
  queryIndex = (queryIndex + 1) % 2;
  if (newLyric) {
    console.log(newLyric);

    // Create notification
    chrome.notifications.create("steelyDanLyric", {
      type: "basic",
      iconUrl: "img/double-helix-icon48.png",
      title: newLyric,
      message: "5 seconds to name song, album. Go!",
    });
  }
});
