// The list of apps/builds to track.
// Each entry is polled independently every POLL_INTERVAL_MS.
export const APP_DEFS = [
  {
    id: "3488080",
    name: "Deadlock (Experimental)",
    url: "https://api.steampowered.com/IGCVersion_3488080/GetClientVersion/v1",
    sound: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    soundDuration: null,
  },
  {
    id: "1422450",
    name: "Deadlock",
    url: "https://api.steampowered.com/IGCVersion_1422450/GetClientVersion/v1",
    sound: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    soundDuration: null,
  },
  {
    id: "3781850",
    name: "Deadlock Canary",
    url: "https://api.steampowered.com/IGCVersion_3781850/GetClientVersion/v1",
    sound: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    soundDuration: 1,
  },
  {
    id: "3125160",
    name: "Deadlock NDA",
    url: "https://api.steampowered.com/IGCVersion_3125160/GetServerVersion/v1",
    sound: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    soundDuration: 1,
  },
];

// How often (ms) to poll every app's endpoint.
export const POLL_INTERVAL_MS = 30_000;

// How long (ms) to wait for each HTTP request before giving up.
export const FETCH_TIMEOUT_MS = 10_000;
