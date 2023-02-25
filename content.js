// get the most recently displayed lyric from background.js
// display it in the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("From background.js");
  console.log(request.lyric);
  const infoSpan = document.getElementById("info");
  infoSpan.textContent = `The most recent random lyric (last 24 hours) was ${request.lyric}`;
});
