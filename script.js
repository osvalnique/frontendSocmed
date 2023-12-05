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

async function register() {
  const email = document.getElementById("registerEmail").value;
  const name = document.getElementById("registerName").value;
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

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
      window.location.href = "./home.html";
    }
  } catch (error) {
    alert(error);
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
  console.log(data);
  localStorage.setItem("accessToken", result.access_token);
  localStorage.setItem("refreshToken", result.refresh_token);
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
  console.log("data", data);

  if (data.img_url != "") {
    avatar_img.forEach((avatar) => {
      avatar.src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
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
  console.log(res);
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
      // console.log(tweet);
      if (btn.id) {
        tweet = postTweet.value;
        attachment = postImg.files[0];
      }
      // console.log(attachment);
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
      let now = new Date();
      let time = now - new Date(t.created_at);
      let date = Math.floor(new Date(time) / 1000 / 60 / 60 / 24) + " days ago";

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
                      <div>
                        <i class="bi bi-three-dots"></i>
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
    console.error(error);
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
  let searchResult = await search(keyword);
  let navUser = document.querySelector("#nav-user");

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
  console.log("searchResult", searchResult);
}

let formSearch = document.getElementById("form-search");
formSearch.addEventListener("submit", function (e) {
  e.preventDefault();
  let keyword = new FormData(this).get("keyword");
  searching(keyword);
});
formSearch.querySelector("input").addEventListener("keyup", function (e) {
  e.preventDefault();
  // if (e.key === "Enter" || e.keyCode === 13) {
  //   let keyword = this.value;
  //   searching(keyword);
  // }
  if (this.value != "") {
    searching(this.value);
  }
});
