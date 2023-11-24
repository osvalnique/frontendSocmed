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
  if (res.status != 200) {
    alert(result.msg);
  } else {
    window.location.href = "./home.html";
  }
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

let data = parseJwt(accessToken);
const avatar = document.getElementsByClassName("avatar");
const avatarName = document.getElementById("avatar-name");
const avatarUsername = document.getElementById("avatar-username");
const parsed = parseJwt(accessToken);
const avatar_img = document.querySelectorAll("img.avatar");

if (avatarName) {
  avatarName.innerHTML = data.name;
  avatarUsername.innerHTML = data.sub;
  avatar.src = data.img_url;
  if (data.img_url != "") {
    avatar_img.forEach((avatar) => {
      avatar.src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
    });
  }
  avatar.alt = data.name;
}

async function newTweet(tweet) {
  const formData = new FormData();
  formData.append("tweet", tweet);

  let res = await fetch("http://127.0.0.1:5000/tweet/post", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });
  // console.log("res");
  if (res.ok) {
    let data = await res.json();
    console.log(data);
  } else {
    console.log(res.msg);
  }
}

const postButton = document.getElementById("postButton");
const postTweet = document.getElementById("postTweet");

if (postButton) {
  postButton.addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    let tweet = postTweet.value;
    await newTweet(tweet);
  });
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
      let now = new Date();
      let time = now - new Date(t.created_at);
      let date = Math.floor(new Date(time) / 1000 / 60 / 60 / 24) + " days ago";
      container.innerHTML += `<div class="tweet">
            <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
              <div class="d-flex">
                <div>
                  <img
                    src="${tweetAva} "
                    style="object-fit: cover; margin: 20px 20px 30px 10px; width: 50px; height: 50px; border-radius:50%"
                  />
                </div>
                <div class="col">
                  <div class="row">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex" style="gap: 10px">
                        <span><b>${t.name}</b></span>
                        <span>${t.username}</span>
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
                  ${
                    t.attachment
                      ? '<div class="row p-0 m-0 rounded border border-dark" style="width: 620px; object-fit: fill;"> <img src="/asset/sample1.jpg" /></div>'
                      : ""
                  }
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
  })
  .catch((error) => {
    console.error(error);
  });
