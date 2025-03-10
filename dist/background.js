"use strict";
/*
A Chrome extension which puts a random lyric by Steely Dan in a browser notification
HTML, CSS, TS, JS

- the extension sets an alarm every 7 hours
- the alarm event listener calls the getSong function

- getSong returns a song object, which includes:
  1/ a lyric snippet
  2/ the song from which the lyric snippet is sourced
  3/ the album upon which the song appears
  4/ the album image

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
// const BASE_INTERVAL = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
const RANDOM_OFFSET = Math.floor(Math.random() * 30 * 60 * 1000) - (15 * 60 * 1000);
// const FETCH_INTERVAL = BASE_INTERVAL + RANDOM_OFFSET; // fetch interval is between 6 hours 45 minutes and 7 hours 15 minutes
const BASE_INTERVAL = 60 * 1000;
const FETCH_INTERVAL = BASE_INTERVAL;
let lastFetchTime = 0;
async function getSong() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastFetchTime;
    if (elapsedTime >= FETCH_INTERVAL || lastFetchTime === 0) {
        try {
            const apiUrl = "http://45.158.140.32/random-lyric";
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            const song = await response.json();
            console.log(song);
            if (song) {
                console.log("Song:", song);
                lastFetchTime = currentTime;
                return song;
            }
            else {
                console.log("No song data found.");
                return null;
            }
        }
        catch (error) {
            console.log("There was a fetch error:", error);
            return null;
        }
    }
    return null;
}
async function getAndNotifySong() {
    try {
        const newSong = await getSong();
        // If a song is successfully retrieved, display the notification and store it locally
        if (newSong && newSong.lyric) {
            chrome.notifications.create(ALARM_NAME, {
                type: "basic",
                iconUrl: "img/double-helix-icon128.png",
                title: newSong.lyric,
                message: "",
            });
            await chrome.storage.local.set({ song: newSong });
        }
        else {
            console.log("Failed to fetch new song. Will try again at next interval.");
        }
    }
    catch (error) {
        console.error("An error occurred while fetching or storing the song data:", error);
    }
}
chrome.alarms.onAlarm.addListener(async () => {
    await getAndNotifySong();
    chrome.alarms.create(ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
});
// on installation:
chrome.runtime.onInstalled.addListener(async () => {
    chrome.alarms.create(ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
    await getAndNotifySong();
});
