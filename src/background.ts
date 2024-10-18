/* 
A Chrome extension which puts a random lyric by Steely Dan in a browser notification
HTML, CSS, TS, JS

- the extension sets an alarm every 7 hours
- the alarm event listener calls the getSong function
- getSong selects one of three queries to a HiGraph query object
- (1st 100 results, 2nd 100 results, last 100 results: this is to get around HiGraph's 100 return limit)

- getSong returns a song object, which includes:
  1/ a lyric snippet
  2/ the song from which the lyric snippet is sourced
  3/ the album upon which the song appears
  4/ the albumId (1-9)

- the song object populates a basic Chrome browser notification with the lyric snippet
- the song object is stored in local storage, over-writing the previously stored song object

- if the user clicks the extension button:
  1/ the song object is returned from local storage
  2/ an HTML pop-up displays:
    1/ the lyric snippet
    2/ the song from which the lyric snippet is sourced
    3/ the name of the album upon which the song appears
    4/ the cover art of the album
*/
const ALARM_NAME = "steelyDanItem";
const BASE_INTERVAL = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
const RANDOM_OFFSET = Math.floor(Math.random() * 30 * 60 * 1000) - (15 * 60 * 1000);
const FETCH_INTERVAL = BASE_INTERVAL + RANDOM_OFFSET; // fetch interval is between 6 hours 45 minutes and 7 hours 15 minutes

let lastFetchTime = 0;

type Song = {
  lyric: string;
  song_name: string;
  album: string;
  albumId: number;
}

type SongData = {
  data: {
    steelyDanItems: Song[];
  };
}

const lyricQueries = [
  `
    query SteelyDanItems1st100 {
      steelyDanItems(first: 100) {
        lyric
        song_name
        album
        albumId
      }
    }
  `,

  `
    query SteelyDanItems2nd100 {
      steelyDanItems(first: 100, skip:100) {
        lyric
        song_name
        album
        albumId
      }
    }
  `,

  `
    query SteelyDanItemsLast100 {
      steelyDanItems(last: 100) {
        lyric
        song_name
        album
        albumId
      }
    }
  `,
];

async function getSong(queryIndex: number): Promise<Song | null> {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastFetchTime;

  // get a random number between 0 and 100
  const randomNumber = Math.floor(Math.random() * 100);
  const query = lyricQueries[queryIndex];

  if (elapsedTime >= FETCH_INTERVAL || lastFetchTime === 0) {
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
        },
      );

      const songData: SongData = await response.json();
      // HiGraph applies a long random string to each entry as an iD
      // we can't use that to select from an array.
      // so instead we use the random number {0..100}
      // to select one song from the array
      const song = songData?.data?.steelyDanItems[randomNumber];
      if (song) {
        lastFetchTime = currentTime;
        return song;
      } else {
        console.log("No song data found.");
        return null;
      }
    } catch (error) {
      console.log("There was a fetch error:", error);
      return null;
    }
  }
  return null;
}

async function getAndNotifySong(): Promise<void> {
  try {
    const queryIndex = Math.floor(Math.random() * lyricQueries.length);
    const newSong = await getSong(queryIndex);

    // If a song is successfully retrieved, display the notification and store it locally
    if (newSong && newSong.lyric) {
      chrome.notifications.create(ALARM_NAME, {
        type: "basic",
        iconUrl: "img/double-helix-icon128.png",
        title: newSong.lyric,
        message: "",
      });

      await chrome.storage.local.set({ songData: newSong });
    } else {
      console.log("Failed to fetch new song. Will try again at next interval.");
    }
  } catch (error) {
    console.error("An error occurred while fetching or storing the song data:", error);
  }
}

chrome.alarms.onAlarm.addListener(async () => {
  await getAndNotifySong();
  chrome.alarms.create(ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
});

// on installation:
chrome.runtime.onInstalled.addListener(async () => {
  await getAndNotifySong();
  chrome.alarms.create(ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
});
