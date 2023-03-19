/* 
A Chrome extension which puts a random lyric by Steely Dan in a browser notification
HTML, CSS, JS, TS

- the extension sets an alarm every 8 hours
- the alarm event listener calls the getSong function
- getSong selects one of three queries to a HiGraph query object
- (1st 100 results, 2nd 100 results, last 100 results: this is to get around HiGraph's 100 return limit)

- getSong returns a song object, which includes:
  1/ a lyric snippet
  2/ the song from which the lyric snippet is sourced
  3/ the album upon which the song appears

- the song object populates a basic Chrome browser notification with the lyric snippet
- the song object is stored in local storage, over-writing any previous song object

- if the user clicks the extension button:
  1/ the song object is returned from local storage
  2/ an HTML pop-up displays:
    1/ the lyric snippet
    2/ the song from which the lyric snippet is sourced
    3/ the name of the album upon which the song appears
    4/ the cover art of the album
*/

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
  // Set the alarm to trigger in the next 8 hours
  when: Date.now() + Math.floor(Math.random() * 8 * 60 * 60 * 1000),
});

chrome.alarms.onAlarm.addListener(async () => {
  // Reset the alarm for the next time
  chrome.alarms.create("steelyDanLyric", {
    when: Date.now() + 8 * 60 * 60 * 1000, // Set the alarm to trigger in 8 hours
  });

  // set query index to 1, 2, or 3
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
