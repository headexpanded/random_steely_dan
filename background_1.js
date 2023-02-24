async function getLyric() {
  const randomNumber = Math.floor(Math.random() * 22);
  console.log("getLyric called");
  const query = `
    query SteelyDanLyrics {
  steelyDanLyrics(where: {}, first: 22) {
    lyric
  }
}
  `;

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
    return data.data.steelyDanLyrics[randomNumber].lyric;
  } catch (error) {
    console.log("There was an error:", error);
  }
}

let lastFetchedTime = 0;

/* function getRandomTime() {
  // Generate a random number of seconds
  const randomSeconds = Math.floor(Math.random() * 10) + 1;

  // Convert the random number of seconds to a Date object
  const randomTime = new Date(Date.now() + randomSeconds * 10000);
  console.log(randomTime);
  return randomTime;
} */

chrome.alarms.create("steelyDanLyric", {
  periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const currentTime = Date.now();
  if (currentTime - lastFetchedTime >= 12000) {
    const lyric = await getLyric();
    console.log(lyric);
    lastFetchedTime = currentTime;
  }

  chrome.storage.local.get(["timer"], (res) => {
    const time = res.timer ?? 0;
    chrome.storage.local.set({
      timer: time + 1,
    });
    if (time % 20 == 0) {
      this.registration.showNotification(lyric, {
        icon: "img/double-helix-icon128.png",
      });
    }
  });
});
