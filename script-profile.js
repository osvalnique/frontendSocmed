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
const userRole = localStorage.getItem("userRole");
if (userRole == "developer") {
  document.getElementById("btn-reporting").style.display = "block";
} else {
  document.getElementById("btn-reporting").style.display = "none";
}

let data = parseJwt(accessToken);
let q = window.location.search;
let query = new URLSearchParams(q);
let username = query.get("username");
let userId = query.get("userid");

const avatar_img = document.querySelectorAll("img.avatar-img");
const avatar = document.getElementById("avatar");
const avatarName = document.querySelectorAll(".avatar-name");
const avatarUsername = document.querySelectorAll(".avatar-username");
const parsed = parseJwt(accessToken);

if (avatar) {
  avatar.src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
}

Array.from(avatarName).forEach((e) => {
  e.innerHTML = data.name;
});

Array.from(avatarUsername).forEach((e) => {
  e.innerHTML = data.username;
  console.log("avatar", data.username);
});

const back = document.getElementById("back");
back.addEventListener("click", () => {
  window.history.back();
});

const logout = document.getElementById("btn-logout");
if (logout) {
  logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("./landing.html");
  });
}

async function getTweet() {
  let tweet = await fetch("http://127.0.0.1:5000/tweet/user_id/" + userId, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (tweet.ok) {
    let data = await tweet.json();

    return data;
  }
}

async function getUser(id) {
  let response = await fetch("http://127.0.0.1:5000/user_id/" + id, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let user = await response.json();
  return user;
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

async function tweetList() {
  const tweetContainer = document.getElementById("tweet-container");
  let tweetList = await getTweet();
  tweetContainer.innerHTML = "";
  tweetList.forEach((t) => {
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + t.profile;
    let attachment = "http://127.0.0.1:5000/user/get_picture/" + t.attachment;
    let now = new Date();
    let time = now - new Date(t.created_at);
    let date = Math.floor(new Date(time) / 1000 / 60 / 60 / 24) + " days ago";

    tweetContainer.innerHTML += `<div class="tweet">
  <div class="p-2 pe-4 pe-4 border boreder-dark border-top-0">
    <div class="d-flex">
      <div>
        <img src="${
          t.profile ? tweetAva : "asset/default.png"
        }" style="object-fit: cover; margin: 20px 20px 30px 10px; width: 50px; height: 50px; border-radius:50%" />
      </div>
      <div class="col">
        <div class="row">
          <div class="d-flex justify-content-between">
            <div class="d-flex" style="gap: 10px">
              <span><b>${t.name}</b></span>
              <span>${t.username}</span>
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
        <div class="px-3">
          <!-- icons -->
          <div class="d-flex py-2 justify-content-between">
                      <div><i data-username="${t.username}" data-tweetid="${
      t.tweet_id
    }" class="bi bi-heart${
      t.liked_list.find((l) => l == t.username) ? "-fill" : ""
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
}

tweetList();

async function setProfileImg() {
  let user = await getUser(userId);
  if (user.result.profile_picture) {
    avatar_img[1].src =
      "http://127.0.0.1:5000/user/get_avatar/" + user.result.profile_picture;
  }
  if (data.img_url) {
    avatar_img[0].src = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
  }
}
setProfileImg();

async function dataProfile() {
  let dataProfile = await fetch("http://127.0.0.1:5000/user_id/" + userId, {
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
  let username = profile.result.username;
  const usernameHeader = document.getElementById("username-header");
  const tweet_count = document.getElementById("tweet-count");
  const follower_count = document.getElementById("follower-count");
  const following_count = document.getElementById("following-count");
  const myBio = document.getElementById("my-bio");
  tweet_count.innerHTML = tweetCount;
  follower_count.innerHTML = followersCount;
  following_count.innerHTML = followingCount;
  myBio.innerHTML = bio;
  usernameHeader.innerHTML = username;

  const editProfile = document.getElementById("edit-form");
  editProfile.querySelector("textarea[name='bio']").value = bio;
  editProfile.querySelector("input[name='name']").value = profile.result.name;
  editProfile.querySelector("input[name='username']").value = username;
}
profile();

async function followingList(id) {
  let res = await fetch("http://127.0.0.1:5000/user/following_list/" + id, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let following = await res.json();
  return following;
}

async function showFollowing(id) {
  let result = await followingList(id);
  let followingListContainer = document.querySelector("#following-list");
  followingListContainer.innerHTML = "";
  result.result.following.forEach((f) => {
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + f.img_url;
    followingListContainer.innerHTML += `<div class="col d-flex py-1 px-4 border">
    <div class="my-auto">
      <img src="${
        f.img_url ? tweetAva : "asset/default.png"
      }" style="width: 40px; height:40px; border-radius:50% ; margin-right: 10px; object-fit: cover"/>
    </div>
    <div class="col">
      <div class="row">
        <div class="d-flex">
          <div class="row">
          <a href="profile.html?userid=${
            f.user_id
          }" style="text-decoration: none; color: black">
          <span><b>${f.name}</b></span><a>
          <a href="profile.html?userid=${
            f.user_id
          }" style="text-decoration: none; color: black">
          <span>${f.username}</span><a>
          </div>
        </div>
      </div>
    </div>
</div>`;
  });
}

let buttonFollowingList = document.getElementById("btn-followinglist");
buttonFollowingList.addEventListener("click", async function (e) {
  e.preventDefault();
  let followingList = await showFollowing(userId);
});

async function followedList(id) {
  let res = await fetch("http://127.0.0.1:5000/user/followed_list/" + id, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let followed = await res.json();
  return followed;
}

async function showFollower(id) {
  let result = await followedList(id);
  let followerListContainer = document.querySelector("#follower-list");
  followerListContainer.innerHTML = "";
  result.result.follower.forEach((f) => {
    let tweetAva = "http://127.0.0.1:5000/user/get_avatar/" + f.img_url;
    followerListContainer.innerHTML += `<div class="col d-flex py-1 px-4 border">
    <div class="my-auto">
      <img src="${
        f.img_url ? tweetAva : "asset/default.png"
      }" style="width: 40px; height:40px; border-radius:50% ; margin-right: 10px; object-fit: cover"/>
    </div>
    <div class="col">
      <div class="row">
        <div class="d-flex">
          <div class="row">
          <a href="profile.html?userid=${
            f.user_id
          }" style="text-decoration: none; color: black">
          <span><b>${f.name}</b></span><a>
          <a href="profile.html?userid=${
            f.user_id
          }" style="text-decoration: none; color: black">
          <span>${f.username}</span><a>
          </div>
        </div>
      </div>
    </div>
</div>`;
  });
}

let buttonFollowerList = document.getElementById("btn-followerlist");
buttonFollowerList.addEventListener("click", async function (e) {
  e.preventDefault();
  console.log("click");
  let followerList = await showFollower(userId);
});

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

async function follow() {
  const editButton = document.getElementById("edit-profile");
  const followButton = document.getElementById("btn-follow");
  const unfollowButton = document.getElementById("btn-unfollow");
  console.log("userId", userId);
  console.log("dataSub", data.sub);

  if (userId != data.sub) {
    let user = await getUser(userId);
    let followings = await followingList(data.sub);
    console.log("followings", followings);
    editButton.style.display = "none";
    let find = followings.result.following.find(
      (u) => u.user_id == user.result.user_id
    );

    if (find) {
      unfollowButton.style.display = "block";
      unfollowButton.addEventListener("click", async () => {
        try {
          let unfollowed = await unfollowUser(userId);
          alert(unfollowed.msg);
          console.log("unfollowed", unfollowed);
          window.location.reload();
        } catch (error) {
          alert(error);
        }
      });
    } else {
      followButton.style.display = "block";
      followButton.addEventListener("click", async () => {
        try {
          let followed = await followUser(userId);
          alert(followed.msg);
          window.location.reload();
        } catch (error) {
          alert(error);
        }
      });
    }
  }
}
follow();

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

async function updateUser(data) {
  let res = await fetch("http://127.0.0.1:5000/user/update", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  updated = await res.json();
  if (!res.ok) {
    alert(updated.msg);
  } else {
    return updated;
  }
}

async function updateImage(data) {
  console.log("data", data);
  let res = await fetch("http://127.0.0.1:5000/user/update/image", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  imgUpdated = await res.json();
  return imgUpdated;
}

async function refresh() {
  let res = await fetch("http://127.0.0.1:5000/refresh", {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  response = await res.json();
  return response;
}

const editForm = document.getElementById("edit-form");
console.log("editForm", editForm);

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let formData = new FormData(editForm);
  let dataObject = Object.fromEntries(formData.entries());
  let update = await updateUser(dataObject);
  console.log("update", dataObject);
  const editImage = document.getElementById("edit-image");
  if (editImage.files[0]) {
    const imgForm = new FormData();
    imgForm.append("new_img", editImage.files[0]);
    let updateImg = await updateImage(imgForm);
  }
  let result = await refresh();
  localStorage.setItem("accessToken", result.access_token);
  if (update) {
    alert(updated.msg);
    window.location.reload();
  }
});

const editImage = document.getElementById("edit-image");
let current_img = "http://127.0.0.1:5000/user/get_avatar/" + data.img_url;
console.log("current_img", current_img);

if (data.img_url) {
  document.getElementById("current-img").src = current_img;
} else {
  document.getElementById("current-img").src = "asset/default.png";
}

editImage.onchange = () => {
  const selectedImage = editImage.files[0];
  if (selectedImage) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("current-img").src = e.target.result;
    };
    reader.readAsDataURL(selectedImage);
  } else {
    document.getElementById("current-img").style.display = "block";
  }
};

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
