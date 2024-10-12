/* 
A Chrome extension which puts a random lyric by Steely Dan in a browser notification
HTML, CSS, TS, JS

- the extension sets an alarm every 8 hours
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
const FETCH_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

let lastFetchTime = 0;

const defaultSong: Song = {
  // in case nothing is returned from getSong() API call
  lyric: "Shine up the battle apple.",
  songName: "Josie",
  album: "Aja",
  albumId: 6,
};

type Song = {
  lyric: string;
  songName: string;
  album: string;
  albumId: number;
}

type songData = {
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

async function getSong(queryIndex: number): Promise<Song> {
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
        }
      );

      const songData: songData = await response.json();
      // HiGraph applies a long random string to each entry as an iD
      // we can't use that to select from an array.
      // so instead we use the random number {0..100}
      // to select one song from the array
      const song = songData?.data?.steelyDanItems[randomNumber];
      lastFetchTime = currentTime;

      return song;
    } catch (error) {
      console.log("There was an error:", error);
      return defaultSong;
    }
  }
  return defaultSong;
}

async function getAndNotifySong(): Promise<void> {
  const queryIndex = Math.floor(Math.random() * lyricQueries.length);
  const newSong = await getSong(queryIndex)

  // If no song is found in local storage, return an empty song object
  if (newSong && newSong.lyric) {
    chrome.notifications.create(ALARM_NAME, {
      type: "basic",
      iconUrl: "img/double-helix-icon128.png",
      title: newSong.lyric,
      message: "",
    });

    chrome.storage.local.set({ songData: newSong });
  } else {
    console.log("Failed to fetch new song.")
  }
}

chrome.alarms.onAlarm.addListener(() => {
  getAndNotifySong();
  // Reset the alarm for the next time
  chrome.alarms.create(ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
});

// on install:
chrome.runtime.onInstalled.addListener(() => {
  getAndNotifySong();
  chrome.alarms.create(ALARM_NAME, {when: Date.now() + FETCH_INTERVAL});
});
