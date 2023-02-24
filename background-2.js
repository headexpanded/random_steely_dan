async function getLyric() {
  const randomNumber = Math.floor(Math.random() * 25);
  console.log("getLyric called");
  const query = `
    query SteelyDanLyrics {
  steelyDanLyrics(where: {}, first: 25) {
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
    const lyric = data.data.steelyDanLyrics[randomNumber].lyric;

    // Create the alarm for the notification
    chrome.alarms.create("steelyDanLyric", {
      when: Date.now() + 2 * 60 * 1000,
    });

    // Return the lyric
    return lyric;
  } catch (error) {
    console.log("There was an error:", error);
  }

  // Call the getLyric function again after 2 minutes
  setTimeout(getLyric, 2 * 60 * 1000);
}

// Call the getLyric function initially
getLyric();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const lyric = await getLyric();
  console.log(lyric);
  chrome.storage.local.get(["timer"], (res) => {
    const time = res.timer ?? 0;
    chrome.storage.local.set({
      timer: time + 1,
    });
    if (time % 10 == 0) {
      this.registration.showNotification(lyric, {
        icon: "img/double-helix-icon128.png",
      });
    }
  });
});
