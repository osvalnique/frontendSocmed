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
const refreshToken = localStorage.getItem("refreshToken");

let data = parseJwt(accessToken);
const myProfile = document.getElementById("my-profile");
myProfile.href = "profile.html?userid=" + data.user_id;

const avatar = document.getElementsByClassName("avatar");
const avatarName = document.querySelector("#avatar-name");
const avatarUsername = document.getElementById("avatar-username");
const headerUsername = document.getElementById("header-username");
const parsed = parseJwt(accessToken);
const avatarImg = document.querySelectorAll("img.avatar");

const logout = document.getElementById("btn-logout");
if (logout) {
  logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("./landing.html");
  });
}

if (avatarName) {
  avatarName.innerHTML = data.name;
  avatarUsername.innerHTML = data.username;
  headerUsername.innerHTML = data.username;
  avatar.src = data.img_url;

  if (data.img_url != "") {
    avatarImg.forEach((avatar) => {
      avatar.src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
    });
  }
  avatar.alt = data.name;
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

async function getStatus() {
  let res = await fetch("http://127.0.0.1:5000/user/status", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const status = await res.json();
  return status;
}
// let status = await getStatus();
getStatus().then((r) => console.log(r));

function timeCount(last_login) {
  let now = new Date();
  let tCreatedAt = new Date(last_login);
  let timeDifference = Math.abs(now - tCreatedAt);

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

async function banUser(id) {
  let res = await fetch("http://127.0.0.1:5000/user/ban/" + id, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let banned = await res.json();
  if (res.status != 200) {
    throw new Error(banned.msg);
  }
  return banned;
}

async function unbanUser(id) {
  let res = await fetch("http://127.0.0.1:5000/user/unban/" + id, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let unban = await res.json();
  if (res.status != 200) {
    throw new Error(unban.msg);
  }
  return unban;
}

getStatus().then((status) => {
  const activeCount = document.getElementById("active-count");
  const inactiveCount = document.getElementById("inactive-count");
  const bannedCount = document.getElementById("banned-count");
  const activeContainer = document.getElementById("active-container");
  const bannedContainer = document.getElementById("banned-container");
  const inactiveContainer = document.getElementById("inactive-container");
  activeCount.innerHTML = status.active_count;
  inactiveCount.innerHTML = status.inactive_count;
  bannedCount.innerHTML = status.banned_count;
  activeContainer.innerHTML = "";
  bannedContainer.innerHTML = "";
  status.active_user.forEach((a) => {
    let lastLogin = timeCount(a.last_login);
    let userAva = "http://127.0.0.1:5000/user/get_avatar/" + a.img_url;
    activeContainer.innerHTML += ` <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
    <div class="d-flex">
      <div>
        <img src="${
          a.img_url ? userAva : "asset/default.png"
        }" style="width: 50px; height: 50px; margin: 20px 20px 30px 10px; border-radius: 50%; object-fit: cover;" />
      </div>
      <div class="col">
        <div class="row">
          <div class="d-flex justify-content-between">
            <div class="d-flex" style="gap: 10px">
              <span><b>${a.name}</b></span>
              <span>${a.username}</span>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between">
          <div>Last Login ${lastLogin}</div>
          <div>
            <button data-id="${
              a.user_id
            }" class="btn-ban button-control blackbg" style="
                    width: 120px;
                    font-size: 13px;
                    margin-left: 30px;
                  ">
              Ban Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  });
  let btnBanned = activeContainer.querySelectorAll(".btn-ban");
  btnBanned.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      try {
        let result = await banUser(this.dataset.id);
        alert(result.msg);
        window.location.reload();
      } catch (error) {
        alert(error);
      }
    });
  });
  status.banned_user.forEach((a) => {
    let lastLogin = timeCount(a.last_login);
    let userAva = "http://127.0.0.1:5000/user/get_avatar/" + a.img_url;
    bannedContainer.innerHTML += ` <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
    <div class="d-flex">
      <div>
        <img src="${
          a.img_url ? userAva : "asset/default.png"
        }" style="width: 50px; height: 50px; margin: 20px 20px 30px 10px; border-radius: 50%; object-fit: cover;" />
      </div>
      <div class="col">
        <div class="row">
          <div class="d-flex justify-content-between">
            <div class="d-flex" style="gap: 10px">
              <span><b>${a.name}</b></span>
              <span>${a.username}</span>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between">
          <div>Last Login ${lastLogin}</div>
          <div>
            <button data-id="${
              a.user_id
            }" class="btn-ban button-control blackbg" style="
                    width: 120px;
                    font-size: 13px;
                    margin-left: 30px;
                  ">
              Unban Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  });
  let btnUnban = bannedContainer.querySelectorAll(".btn-ban");
  btnUnban.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      try {
        let result = await unbanUser(this.dataset.id);
        alert(result.msg);
        window.location.reload();
      } catch (error) {
        alert(error);
      }
    });
  });
  status.inactive_user.forEach((a) => {
    let lastLogin = timeCount(a.last_login);
    let userAva = "http://127.0.0.1:5000/user/get_avatar/" + a.img_url;
    inactiveContainer.innerHTML += ` <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
    <div class="d-flex">
      <div>
        <img src="${
          a.img_url ? userAva : "asset/default.png"
        }" style="width: 50px; height: 50px; margin: 20px 20px 30px 10px; border-radius: 50%; object-fit: cover;" />
      </div>
      <div class="col">
        <div class="row">
          <div class="d-flex justify-content-between">
            <div class="d-flex" style="gap: 10px">
              <span><b>${a.name}</b></span>
              <span>${a.username}</span>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between">
          <div>Last Login ${lastLogin}</div>
        </div>
      </div>
    </div>
  </div>`;
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
