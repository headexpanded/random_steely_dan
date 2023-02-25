let lastFetchTime = 0;
let queryIndex = 0;

const queries = [
  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, first: 100) {
        lyric
        song
        album
      }
    }
  `,

  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, first: 100, skip:100) {
        lyric
        song
        album
      }
    }
  `,

  `
    query SteelyDanLyrics {
      steelyDanLyrics(where: {}, last: 100) {
        lyric
        song
        album
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

chrome.alarms.create("steelyDanLyric", {
  when: Date.now() + Math.floor(Math.random() * 1 * 60 * 60 * 1000), // Set a random time for the alarm to trigger within the next hour
});

chrome.alarms.onAlarm.addListener(async () => {
  // Reset the alarm for the next day
  chrome.alarms.create("steelyDanLyric", {
    when: Date.now() + 1 * 60 * 60 * 1000, // Set the alarm to trigger in one hour
  });

  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      queryIndex = (queryIndex + 1) % 3;
      const newLyric = await getLyric(queryIndex);
      if (newLyric) {
        console.log(newLyric);

        chrome.notifications.create(
          "steelyDanLyric",
          {
            type: "basic",
            iconUrl: "img/double-helix-icon128.png",
            title: newLyric,
            message: "",
          },
          function () {
            chrome.tabs.sendMessage(tabs[0].id, { lyric: newLyric });
          }
        );
      }
    }
  );
});
