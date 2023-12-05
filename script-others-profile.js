var validRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // return base64;
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
if (localStorage.getItem("accessToken")) {
  console.log(parseJwt(localStorage.getItem("accessToken")));
  localStorage.setItem(
    "userData",
    parseJwt(localStorage.getItem("accessToken"))
  );
} else {
  console.log("no token");
}
const accessToken = localStorage.getItem("accessToken");
let data = parseJwt(accessToken);
const avatar_img = document.querySelectorAll("img.avatar-img");
const avatarName = document.querySelectorAll(".avatar-name");
const avatarUsername = document.querySelectorAll(".avatar-username");
const parsed = parseJwt(accessToken);

async function getUser() {
  let response = await fetch("http://127.0.0.1:5000/tweet/user_id/" + user_id);
}

Array.from(avatar_img).forEach((e) => {
  e.src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
});

Array.from(avatarName).forEach((e) => {
  e.innerHTML = data.name;
});

Array.from(avatarUsername).forEach((e) => {
  e.innerHTML = data.sub;
});

async function getTweet() {
  let tweet = await fetch(
    "http://127.0.0.1:5000/tweet/search/username/" + data.sub,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (tweet.ok) {
    let data = await tweet.json();
    // console.log("data", data);
    return data.tweets;
  }
}

async function tweetList() {
  const tweetContainer = document.getElementById("tweet-container");
  let tweetList = await getTweet();
  tweetContainer.innerHTML = "";
  tweetList.forEach((t) => {
    console.log("t", t);
    tweetContainer.innerHTML += `<div class="tweet">
  <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
    <div class="d-flex">
      <div>
        <img src="${
          data.img_url
            ? "http://127.0.0.1:5000/user/get_avatar/" + data.img_url
            : "asset/default.png"
        }" style="object-fit: cover; margin: 20px 20px 30px 10px; width: 50px; height: 50px; border-radius:50%" />
      </div>
      <div class="col">
        <div class="row">
          <div class="d-flex justify-content-between">
            <div class="d-flex" style="gap: 10px">
              <span><b>${data.name}</b></span>
              <span>${data.sub}</span>
            </div>
            <div>
              <i class="bi bi-three-dots"></i>
            </div>
          </div>
        </div>
        <div class="row m-0">
          ${t.tweet}
        </div>
        <div class="px-3">
          <!-- icons -->
          <div class="d-flex py-2 justify-content-between">
            <div><i class="bi bi-chat me-1"></i><span>10</span></div>
            <div><i class="bi bi-repeat me-1"></i><span>20</span></div>
            <div><i class="bi bi-heart me-1"></i><span>30</span></div>
            <div>
              <i class="bi bi-bar-chart-line me-1"></i><span>40</span>
            </div>
          </div>
          <!-- icons -->
        </div>
      </div>
    </div>
  </div>
</div>`;
  });
}
tweetList();

async function dataProfile() {
  let dataProfile = await fetch("http://127.0.0.1:5000/user/" + data.sub, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let result = await dataProfile.json();
  return result;
}
dataProfile();

async function profile() {
  let profile = await dataProfile();
  let tweetCount = profile.result.tweet_count;
  let followersCount = profile.result.followers_count;
  let followingCount = profile.result.following_count;
  let bio = profile.result.bio;
  const tweet_count = document.getElementById("tweet-count");
  const follower_count = document.getElementById("follower-count");
  const following_count = document.getElementById("following-count");
  const myBio = document.getElementById("my-bio");
  tweet_count.innerHTML = tweetCount;
  follower_count.innerHTML = followersCount;
  following_count.innerHTML = followingCount;
  myBio.innerHTML = bio;
}
profile();

async function newTweet(tweet) {
  const formData = new FormData();
  formData.append("tweet", tweet);

  let res = await fetch("http://127.0.0.1:5000/tweet/post", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  let data = await res.json();
  if (res.ok) {
    alert(data.msg);
    window.location.reload();
  } else {
    return alert(data.msg);
  }
}

const postButton = document.getElementsByClassName("postButton");
const postTweet = document.getElementById("postTweet");
const modalPostTweet = document.getElementById("modalPostTweet");

if (postButton.length > 0) {
  Array.from(postButton).forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      e.stopPropagation();
      let tweet = modalPostTweet.value;
      console.log(tweet);
      if (btn.id) {
        tweet = postTweet.value;
      }
      await newTweet(tweet);
    });
  });
}
