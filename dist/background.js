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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

// Configuration
const CONFIG = {
    ALARM_NAME: "steelyDanItem",
    BASE_INTERVAL: 1 * 60 * 1000, // 1 minute in milliseconds (temporarily changed from 7 hours for testing)
    MAX_RANDOM_OFFSET: 30 * 60 * 1000, // 30 minutes in milliseconds
    API_URL: "http://45.158.140.32/random-lyric",
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000, // 5 seconds
    FETCH_TIMEOUT: 10000, // 10 seconds
    NOTIFICATION_ID: 'steelyDanNotification',
    NOTIFICATION_DURATION: 10000 // 10 seconds
};
// Cache the fetch interval for the session
const FETCH_INTERVAL = CONFIG.BASE_INTERVAL; // Temporarily removed random offset for testing
let lastFetchTime = 0;
let currentNotificationId = null;
let notificationTimeout = null;
class FetchError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'FetchError';
    }
}
// Utility function to handle fetch with timeout
function fetchWithTimeout(url, options, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
            clearTimeout(id);
            return response;
        }
        catch (error) {
            clearTimeout(id);
            throw error;
        }
    });
}
function getSong(retryCount = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastFetchTime;
        if (elapsedTime >= FETCH_INTERVAL || lastFetchTime === 0) {
            try {
                const response = yield fetchWithTimeout(CONFIG.API_URL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }, CONFIG.FETCH_TIMEOUT);
                if (!response.ok) {
                    throw new FetchError(`HTTP error! status: ${response.status}`, response.status);
                }
                const song = yield response.json();
                if (!song || !song.lyric) {
                    throw new Error("Invalid song data received");
                }
                lastFetchTime = currentTime;
                return song;
            }
            catch (error) {
                console.error("Error fetching song:", error);
                if (retryCount < CONFIG.MAX_RETRIES) {
                    yield new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                    return getSong(retryCount + 1);
                }
                throw error;
            }
        }
        // If we're within the fetch interval, return the last stored song
        const stored = yield chrome.storage.local.get('song');
        if (stored.song) {
            return stored.song;
        }
        throw new Error("No song available and too soon to fetch new one");
    });
}
function clearNotificationTimeout() {
    if (notificationTimeout !== null) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
}
function getAndNotifySong() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newSong = yield getSong();
            // Clear previous notification and timeout
            if (currentNotificationId) {
                chrome.notifications.clear(currentNotificationId);
            }
            clearNotificationTimeout();
            // Create new notification with unique ID
            const notificationId = `${CONFIG.NOTIFICATION_ID}_${Date.now()}`;
            chrome.notifications.create(notificationId, {
                type: "basic",
                iconUrl: "img/double-helix-icon128.png",
                title: newSong.lyric,
                message: "",
                priority: 0,
                requireInteraction: false
            });
            // Set up auto-clear with a single timeout
            notificationTimeout = window.setTimeout(() => {
                chrome.notifications.clear(notificationId);
                if (currentNotificationId === notificationId) {
                    currentNotificationId = null;
                }
                notificationTimeout = null;
            }, CONFIG.NOTIFICATION_DURATION);
            currentNotificationId = notificationId;
            yield chrome.storage.local.set({ song: newSong });
        }
        catch (error) {
            console.error("Failed to fetch or display song:", error);
            // Clear previous notification and timeout
            if (currentNotificationId) {
                chrome.notifications.clear(currentNotificationId);
            }
            clearNotificationTimeout();
            const errorNotificationId = `${CONFIG.NOTIFICATION_ID}_error_${Date.now()}`;
            chrome.notifications.create(errorNotificationId, {
                type: "basic",
                iconUrl: "img/double-helix-icon128.png",
                title: "Error",
                message: "Unable to fetch new Steely Dan lyrics. Will try again later.",
                priority: 0,
                requireInteraction: false
            });
            // Set up auto-clear for error notification
            notificationTimeout = window.setTimeout(() => {
                chrome.notifications.clear(errorNotificationId);
                notificationTimeout = null;
            }, CONFIG.NOTIFICATION_DURATION);
        }
    });
}
let alarmTimeout = null;
chrome.alarms.onAlarm.addListener((alarm) => __awaiter(void 0, void 0, void 0, function* () {
    if (alarm.name === CONFIG.ALARM_NAME) {
        // Clear any existing timeout
        if (alarmTimeout !== null) {
            clearTimeout(alarmTimeout);
        }
        yield getAndNotifySong();
        // Set up next alarm with debouncing
        alarmTimeout = window.setTimeout(() => {
            chrome.alarms.create(CONFIG.ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
            alarmTimeout = null;
        }, 1000); // Debounce for 1 second
    }
}));
// on installation:
chrome.runtime.onInstalled.addListener(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clear any existing alarms first
    yield chrome.alarms.clear(CONFIG.ALARM_NAME);
    chrome.alarms.create(CONFIG.ALARM_NAME, { when: Date.now() + FETCH_INTERVAL });
    yield getAndNotifySong();
}));
