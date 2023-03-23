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
const ALARM_NAME: string = "steelyDanItem";
let lastFetchTime: number = 0;
const defaultSong: Song = {
  // in case nothing is returned from getSong() API call
  lyric: "Shine up the battle apple.",
  song_name: "Josie",
  album: "Aja",
  albumId: 6,
};

interface Song {
  lyric: string;
  song_name: string;
  album: string;
  albumId: number;
}

interface songData {
  data: {
    steelyDanItems: {
      lyric: string;
      song_name: string;
      album: string;
      albumId: number;
    }[];
  };
}

const lyricQueries: string[] = [
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
  const currentTime: number = Date.now();
  const elapsedTime: number = currentTime - lastFetchTime;
  const fetchInterval: number = 8 * 60 * 1000;
  // get a random number between 0 and 100
  const randomNumber: number = Math.floor(Math.random() * 100);
  const query: string = lyricQueries[queryIndex];

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

      const songData: songData = await response.json();
      // HiGraph applies a long random string to each entry as an iD
      // we can't use that to select from an array.
      // so instead we use the random number {0..100}
      // to select one song from the array
      const song: Song = songData.data.steelyDanItems[randomNumber];
      lastFetchTime = currentTime;

      // Return the song
      return song;
    } catch (error) {
      console.log("There was an error:", error);
      const song: Song = defaultSong;
      return song;
    }
  } else {
    console.log("Fetch call skipped");
    const song: Song = defaultSong;
    return song;
  }
}

async function getAndNotifySong(): Promise<Song> {
  //
  let queryIndex: number = 0;
  // Setting the query index to 1, 2, or 3
  // allows us to get any song from the +250 items in the db
  // despite HiGraph limiting returns to only 100 items
  queryIndex = (queryIndex + 1) % 3;
  const newSong = await getSong(queryIndex);
  if (newSong) {
    chrome.notifications.create(ALARM_NAME, {
      type: "basic",
      iconUrl: "img/double-helix-icon128.png",
      title: newSong.lyric,
      message: "",
    });

    chrome.storage.local.set({ songData: newSong });
  }
  return defaultSong;
}

chrome.alarms.create(ALARM_NAME, {
  // Set the alarm to trigger in the next 8 hours
  when: Date.now() + Math.floor(Math.random() * 8 * 60 * 60 * 1000),
});

chrome.alarms.onAlarm.addListener(async () => {
  // Reset the alarm for the next time
  chrome.alarms.create(ALARM_NAME, {
    when: Date.now() + 8 * 60 * 60 * 1000,
  });
  getAndNotifySong();
});

// on install:
// - create a song lyric notification
// - put a song object into local storage
chrome.runtime.onInstalled.addListener(getAndNotifySong);
