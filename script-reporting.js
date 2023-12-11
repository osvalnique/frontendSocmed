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
