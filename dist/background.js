"use strict";
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
const FETCH_INTERVAL = 8 * 60 * 1000;
let lastFetchTime = 0;
const defaultSong = {
    // in case nothing is returned from getSong() API call
    lyric: "Shine up the battle apple.",
    song_name: "Josie",
    album: "Aja",
    albumId: 6,
};
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
async function getSong(queryIndex) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastFetchTime;
    // get a random number between 0 and 100
    const randomNumber = Math.floor(Math.random() * 100);
    const query = lyricQueries[queryIndex];
    if (elapsedTime >= FETCH_INTERVAL) {
        try {
            const response = await fetch("https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clee001xp54cz01t641jw2zv8/master", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ query }),
            });
            const songData = await response.json();
            // HiGraph applies a long random string to each entry as an iD
            // we can't use that to select from an array.
            // so instead we use the random number {0..100}
            // to select one song from the array
            const song = songData?.data?.steelyDanItems[randomNumber];
            lastFetchTime = currentTime;
            // Return the song
            return song;
        }
        catch (error) {
            console.log("There was an error:", error);
            return defaultSong;
        }
    }
    return defaultSong;
}
async function getAndNotifySong() {
    const queryIndex = [1, 2, 3];
    const index = queryIndex[Math.floor(Math.random() * queryIndex.length)];
    // Check if there is a song in local storage
    const storedSong = await new Promise((resolve) => {
        chrome.storage.local.get('songData', (result) => {
            resolve(result.songData);
        });
    });
    // If no song is found in local storage, return an empty song object
    if (!storedSong) {
        return {
            lyric: "Your next random Steely Dan lyric will be here in about 8 hours' time.",
            song_name: "",
            album: "",
            albumId: 0,
        }; // Return an empty song object conforming to the Song type
    }
    const newSong = await getSong(index);
    if (newSong) {
        chrome.notifications.create(ALARM_NAME, {
            type: "basic",
            iconUrl: "img/double-helix-icon128.png",
            title: newSong.lyric,
            message: "",
        });
        chrome.storage.local.set({ songData: newSong });
        return newSong;
    }
    else {
        return {
            lyric: "Your next random Steely Dan lyric will be here in about 8 hours' time.",
            song_name: "",
            album: "",
            albumId: 0,
        }; // Return an empty song object if newSong is falsy
    }
}
chrome.alarms.create(ALARM_NAME, {
    // Set the alarm to trigger in the next 8 hours
    when: Date.now() + Math.floor(Math.random() * FETCH_INTERVAL * 60),
});
chrome.alarms.onAlarm.addListener(async () => {
    // Reset the alarm for the next time
    chrome.alarms.create(ALARM_NAME, {
        when: Date.now() + FETCH_INTERVAL * 60,
    });
    getAndNotifySong();
});
// on install:
// - create a song lyric notification
// - put a song object into local storage
chrome.runtime.onInstalled.addListener(getAndNotifySong);
