function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // return base64;
  let jsonPayload = decodeURIComponent(
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

async function register() {
  const emailRegex = /^[a-zA-Z0-9._-]{6,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const email = document.getElementById("registerEmail").value;
  const name = document.getElementById("registerName").value;
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  console.log(typeof emailRegex.test(email));
  if (emailRegex.test(email) == false) {
    alert("invalid email");
  } else {
    // alert("false");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);

    try {
      let [res, response] = await create_user(formData);
      if (res.status != 201) {
        throw new Error(response.msg);
      } else {
        alert(response.msg);
        window.location.replace("./landing.html");
      }
    } catch (error) {
      alert(error);
    }
  }
}
async function create_user(formData) {
  const res = await fetch("http://127.0.0.1:5000/user/create_users", {
    method: "POST",
    body: formData,
  });
  const result = await res.json();
  return [res, result];
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const data = JSON.stringify({ username, password });
  const [res, result] = await userLogin(data);
  localStorage.setItem("accessToken", result.access_token);
  localStorage.setItem("refreshToken", result.refresh_token);
  localStorage.setItem("userRole", result.role);
  if (res.status != 200) {
    alert(result.msg);
  } else {
    window.location.href = "./home.html";
  }
}

const logout = document.getElementById("btn-logout");
if (logout) {
  logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("./landing.html");
  });
}

async function userLogin(data) {
  const res = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const result = await res.json();
  return [res, result];
}

const loginButton = document.getElementById("login-button");
if (loginButton) {
  loginButton.addEventListener("click", async () => await login());
  // console.log("storedToken", localStorage.getItem("accessToken"));
}

const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");
const userRole = localStorage.getItem("userRole");
if (userRole == "developer") {
  document.getElementById("btn-reporting").style.display = "block";
} else {
  document.getElementById("btn-reporting").style.display = "none";
}

let data = parseJwt(accessToken);
const myProfile = document.getElementById("my-profile");
myProfile.href = "profile.html?userid=" + data.user_id;

const avatar = document.getElementsByClassName("avatar");
const avatarName = document.getElementById("avatar-name");
const avatarUsername = document.getElementById("avatar-username");
const parsed = parseJwt(accessToken);
const avatar_img = document.querySelectorAll("img.avatar");

if (avatarName) {
  avatarName.innerHTML = data.name;
  avatarUsername.innerHTML = data.username;
  avatar.src = data.img_url;

  if (data.img_url) {
    avatar_img.forEach((avatar) => {
      avatar.src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
    });
  } else {
    avatar_img.forEach((avatar) => {
      avatar.src = "asset/default.png";
    });
  }
  avatar.alt = data.name;
}

async function newTweet(tweet, attachment) {
  const formData = new FormData();
  formData.append("tweet", tweet);
  formData.append("attachment", attachment);

  let res = await fetch("http://127.0.0.1:5000/tweet/post_pict", {
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
const postImg = document.getElementById("postImg");
const modalPostImg = document.getElementById("modalPostImg");
const modalPostTweet = document.getElementById("modalPostTweet");

if (postButton.length > 0) {
  Array.from(postButton).forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      e.stopPropagation();
      let tweet = modalPostTweet.value;
      let attachment = modalPostImg.files[0];
      if (btn.id) {
        tweet = postTweet.value;
        attachment = postImg.files[0];
      }
      await newTweet(tweet, attachment);
    });
  });
}

async function likeTweet(id) {
  let response = await fetch("http://127.0.0.1:5000/tweet/like/" + id, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let res = response.json();
  if (response.ok) {
    return res;
  } else {
    alert(res.msg);
  }
}
async function unlikeTweet(id) {
  let response = await fetch("http://127.0.0.1:5000/tweet/unlike/" + id, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let res = response.json();
  if (response.ok) {
    return res;
  } else {
    alert(res.msg);
  }
}

function timeCount(created_at) {
  let now = new Date();
  let createdAt = new Date(created_at);
  let timeDifference = Math.abs(now - createdAt);

  let seconds = Math.floor(timeDifference / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  let months = Math.floor(days / 30);

  hours %= 24;
  minutes %= 60;
  seconds %= 60;

  if (months > 0) {
    if (months > 1) {
      return months + " months ago";
    }
    return months + " month ago";
  }
  if (days > 0) {
    return days + " days ago";
  }
  if (hours > 0) {
    return hours + " hours ago";
  }
  if (minutes > 0) {
    return minutes + " minutes ago";
  }
  if (seconds > 0) {
    return seconds + " seconds ago";
  }
}

async function followingTweet() {
  const response = await fetch("http://127.0.0.1:5000/tweet/following_tweets", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const tweets = await response.json();
  return tweets;
}

followingTweet()
  .then((tweets) => {
    const container = document.getElementById("tweet-container");
    container.innerHTML = "";
    tweets.forEach((t) => {
      let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + t.profile;
      let attachment = "http://127.0.0.1:5000/user/get_picture/" + t.attachment;
      let date = timeCount(t.created_at);

      container.innerHTML += `<div class="tweet">
            <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
              <div class="d-flex">
                <div>
                  <img
                    src="${t.profile ? tweetAva : "asset/default.png"}"
                    style="object-fit: cover; margin: 20px 20px 30px 10px; width: 50px; height: 50px; border-radius:50%"
                  />
                </div>
                <div class="col">
                  <div class="row">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex" style="gap: 10px">
                        <a href="profile.html?userid=${
                          t.user_id
                        }" style="text-decoration: none; color: black"><span><b>${
        t.name
      }</b></span></a>
                        <a href="profile.html?userid=${
                          t.user_id
                        }" style="text-decoration: none; color: black"><span>${
        t.username
      }</span></a>
                        <span>${date}</span>
                      </div>
                    </div>
                  </div>
                  <div class="row m-0">
                    ${t.tweet}
                  </div>
                  <div class="row p-0 m-0" style="width: 620px; object-fit: fill;">
                  <img 
                  src="${t.attachment ? attachment : ""}"
                  style="padding: 0px; border-radius: 20px">
                  </div>
                  <div class="px-3">
                    <!-- icons -->
                    <div class="d-flex py-2 justify-content-between">
                      <div><i data-username="${t.username}" data-tweetid="${
        t.tweet_id
      }" class="bi bi-heart${
        t.liked_list.find((l) => l == data.username) ? "-fill" : ""
      } me-1 like"></i><span>${t.liked_count}</span></div>
                      <div>
                      </div>
                    </div>
                    <!-- icons -->
                  </div>
                </div>
              </div>
            </div>
            </div>`;
    });
    let icon = document.querySelectorAll("i.like");

    Array.from(icon).forEach((l) => {
      l.addEventListener("click", async function (e) {
        if (this.classList.contains("bi-heart-fill")) {
          if (await unlikeTweet(l.dataset.tweetid)) {
            this.classList.replace("bi-heart-fill", "bi-heart");
            this.parentElement.querySelector("span").innerHTML =
              parseInt(this.parentElement.querySelector("span").innerHTML) - 1;
            // console.log(this.parentElement.querySelector("span").innerHTML)
          }
        } else {
          if (await likeTweet(l.dataset.tweetid)) {
            this.classList.replace("bi-heart", "bi-heart-fill");
            this.parentElement.querySelector("span").innerHTML =
              parseInt(this.parentElement.querySelector("span").innerHTML) + 1;
          }
        }
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });

async function popularTweet() {
  const response = await fetch("http://127.0.0.1:5000/tweet/popular_tweets");
  const tweets = await response.json();
  return tweets;
}

popularTweet().then((tweets) => {
  const container = document.getElementById("popular-tweet-container");
  container.innerHTML = "";
  tweets.result.forEach((t) => {
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + t.img_url;
    let attachment = "http://127.0.0.1:5000/user/get_picture/" + t.attachment;
    let date = timeCount(t.created_at);
    container.innerHTML += `<div class="tweet">
            <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
              <div class="d-flex">
                <div>
                  <img
                    src="${t.img_url ? tweetAva : "asset/default.png"}"
                    style="object-fit: cover; margin: 20px 20px 30px 10px; width: 50px; height: 50px; border-radius:50%"
                  />
                </div>
                <div class="col">
                  <div class="row">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex" style="gap: 10px">
                        <a href="profile.html?userid=${
                          t.user_id
                        }" style="text-decoration: none; color: black"><span><b>${
      t.name
    }</b></span></a>
                        <a href="profile.html?userid=${
                          t.user_id
                        }" style="text-decoration: none; color: black"><span>${
      t.username
    }</span></a>
                        <span>${date}</span>
                      </div>
                    </div>
                  </div>
                  <div class="row m-0">
                    ${t.tweet}
                  </div>
                  <div class="row p-0 m-0" style="width: 620px; object-fit: fill;">
                  <img 
                  src="${t.attachment ? attachment : ""}"
                  style="padding: 0px; border-radius: 20px">
                  </div>
                  <div class="px-3">
                    <!-- icons -->
                    <div class="d-flex py-2 justify-content-between">
                      <div><i data-username="${t.username}" data-tweetid="${
      t.tweet_id
    }" class="bi bi-heart${
      t.likes.find((l) => l == data.username) ? "-fill" : ""
    } me-1 like"></i><span>${t.liked}</span></div>
                      <div>
                      </div>
                    </div>
                    <!-- icons -->
                  </div>
                </div>
              </div>
            </div>
            </div>`;
  });
});

async function followingList(id) {
  let res = await fetch("http://127.0.0.1:5000/user/following_list/" + id, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let following = await res.json();
  return following;
}

async function followUser(id) {
  let res = await fetch("http://127.0.0.1:5000/user/follow/" + id, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  followed = await res.json();
  if (res.status != 200) {
    throw new Error(followed.msg);
  }
  return followed;
}

async function unfollowUser(id) {
  let res = await fetch("http://127.0.0.1:5000/user/unfollow/" + id, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  unfollowed = await res.json();
  if (res.status != 200) {
    throw new Error(unfollowed.msg);
  }
  return unfollowed;
}

async function popularUser() {
  let res = await fetch("http://127.0.0.1:5000/user/most_followers", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let users = await res.json();
  return users;
}

popularUser().then(async (users) => {
  let list = await followingList(data.sub);
  list = list.result.following.filter((user) => user.user_id != data.sub);
  console.log("list", list);

  const container = document.getElementById("popular-user-container");
  container.innerHTML = "";

  users.result.forEach((u) => {
    let find = list.find((f) => f.user_id == u.user_id);
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + u.img_url;
    if (u.user_id != data.sub) {
      container.innerHTML += `<div class="p-2 pe-4 pe-4 border border-top-0">
    <div class="d-flex">
      <div>
        <img
        src="${u.img_url ? tweetAva : "asset/default.png"}"
        style="object-fit: cover; margin: 20px 20px 30px 10px; width: 50px; height: 50px; border-radius:50%"
        />
      </div>
      <div class="col">
        <div class="row">
          <div class="d-flex justify-content-between">
            <div class="d-flex" style="gap: 10px">
            <a href="profile.html?userid=${
              u.user_id
            }" style="text-decoration: none; color: black"><span><b>${
        u.name
      }</b></span></a>
            <a href="profile.html?userid=${
              u.user_id
            }" style="text-decoration: none; color: black"><span>${
        u.username
      }</span></a>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between">
          <div>Followed by ${u.followers}</div>
          <div>
            <button
              data-id="${u.user_id}" 
              class="button-control blackbg ${find ? "unfollow" : "follow"}"
              style="
                width: 120px;
                font-size: 13px;
                margin-left: 30px;
              "
            >${find ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    }
  });
  Array.from(container.children).forEach((el) => {
    let button = el.querySelector("button");
    button.addEventListener("click", async function (e) {
      if (button.classList.contains("follow")) {
        let result = await followUser(this.dataset.id);
        if (result) {
          alert(result.msg);
          window.location.reload();
        }
      } else {
        let result = await unfollowUser(this.dataset.id);
        alert(result.msg);
        window.location.reload();
      }
    });
  });
});

async function search(keyword) {
  let res = await fetch("http://127.0.0.1:5000/search/" + keyword, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  response = await res.json();
  return response;
}

async function searching(keyword) {
  let navUser = document.querySelector("#nav-user");
  let navTweet = document.querySelector("#nav-tweet");
  if (keyword == "") {
    navUser.innerHTML = "";
    navTweet.innerHTML = "";
    return true;
  }

  let searchResult = await search(keyword);
  navUser.innerHTML = "";
  searchResult.user.forEach((u) => {
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + u.img_url;
    navUser.innerHTML += `<div class="">
    <div class="col d-flex p-2 pe-4 pe-4 border border-top-0">
        <div class="my-auto">
          <img src="${
            u.img_url ? tweetAva : "asset/default.png"
          }" style="width: 40px; height:40px; border-radius:50% ; margin-right: 10px; object-fit: cover"/>
        </div>
        <div class="col">
          <div class="row">
            <div class="d-flex justify-content-between">
              <div class="row">
              <a href="profile.html?userid=${
                u.user_id
              }" style="text-decoration: none; color: black"><span><b>${
      u.name
    }</b></span><a>
              <a href="profile.html?userid=${
                u.user_id
              }" style="text-decoration: none; color: black"><span>${
      u.username
    }</span><a>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>`;
  });

  navTweet.innerHTML = "";
  searchResult.tweet.forEach((t) => {
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + t.img_url;
    let attachment = "http://127.0.0.1:5000/user/get_picture/" + t.attachment;
    navTweet.innerHTML += `
    <div class="accordion" id="accordionExample">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                  <div class="">
                      <div class="d-flex">
                        <div>
                        <img src="${
                          t.img_url ? tweetAva : "asset/default.png"
                        }" style="width: 40px; height:40px; border-radius:50% ; margin-right: 10px; object-fit: cover"/>
                        </div>
                        <div class="col">
                          <div class="row">
                            <div class="d-flex justify-content-between">
                              <div class="m-auto row">
                                <span style="font-size: 14px;"><b>${
                                  t.name
                                }</b></span>
                                <span style="font-size: 14px;">${
                                  t.username
                                }</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                <div class="m-0 pt-1 pb-0 px-2 accordion-body justify-content-center" style="font-size: 11px;">
                  ${t.tweet}
                </div>
                <div class="d-flex justify-content-center">
                  <img src="${
                    t.attachment ? attachment : ""
                  }" style="width: 280px; border-radius: 15px; padding:10px">
                </div>
              </div>
            </div>
          </div>`;
  });
}

let formSearch = document.getElementById("form-search");
let navTab = document.getElementById("nav-tab");
// navTab.style.display = "none";

formSearch.addEventListener("submit", function (e) {
  e.preventDefault();
  let keyword = new FormData(this).get("keyword");
  searching(keyword);
  // navTab.style.display = "block";
});
formSearch.querySelector("input").addEventListener("keyup", function (e) {
  e.preventDefault();
  setTimeout(() => {
    if (this.value != "") {
      searching(this.value);
    } else {
      this.value == "";
      searching(this.value);
    }
  }, 2000);
});
