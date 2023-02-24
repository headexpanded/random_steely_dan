async function getLyric() {
  const randomNumber = Math.floor(Math.random() * 100);
  console.log("getLyric called");
  const query = `
    query SteelyDanLyrics {
  steelyDanLyrics(where: {}, last: 100) {
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
    console.log(data.data.steelyDanLyrics[randomNumber].lyric);
    return data.data.steelyDanLyrics[randomNumber].lyric;
  } catch (error) {
    console.log("There was an error:", error);
  }
}

const lyricSpan = document.getElementById("lyric");
lyricSpan.textContent = `The lyric`;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("From lyric.js");
  console.log(request.msg);
  lyricSpan.innerHTML = request.msg;
});

const timeElement = document.getElementById("time");
const currentTime = new Date().toLocaleTimeString();
timeElement.textContent = `The time is: ${currentTime}`;


