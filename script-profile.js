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
const refreshToken = localStorage.getItem("refreshToken");
let data = parseJwt(accessToken);

let q = window.location.search;
let query = new URLSearchParams(q);
let username = query.get("username");
let userId = query.get("userid");

const avatar_img = document.querySelectorAll("img.avatar-img");
const avatarName = document.querySelectorAll(".avatar-name");
const avatarUsername = document.querySelectorAll(".avatar-username");
const parsed = parseJwt(accessToken);

Array.from(avatarName).forEach((e) => {
  e.innerHTML = data.name;
});

Array.from(avatarUsername).forEach((e) => {
  e.innerHTML = data.username;
  console.log("avatar", data.username);
});

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
  console.log("user", user);
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
  console.log("result", result);
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
  following = await res.json();
  return following;
}

async function followedList(id) {
  let res = await fetch("http://127.0.0.1:5000/user/followed_list/" + id, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  followed = await res.json();
  return followed;
}
// followedList();

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

  if (userId != data.sub) {
    let user = await getUser(userId);
    let followings = await followingList(data.sub);
    editButton.style.display = "none";
    let find = followings.result.following.find(
      (f) => f == user.result.username
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
      if (btn.id) {
        tweet = postTweet.value;
      }
      await newTweet(tweet);
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
  console.log(res.status);
  updated = await res.json();
  return updated;
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
  console.log("response", response);
  return response;
}

const editForm = document.getElementById("edit-form");
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let formData = new FormData(editForm);
  let dataObject = Object.fromEntries(formData.entries());
  let update = await updateUser(dataObject);
  const editImage = document.getElementById("edit-image");
  if (editImage.files[0]) {
    const imgForm = new FormData();
    imgForm.append("new_img", editImage.files[0]);
    let updateImg = await updateImage(imgForm);
  }
  let result = await refresh();
  localStorage.setItem("accessToken", result.access_token);
  window.location.reload();
});
const editImage = document.getElementById("edit-image");
editImage.onchange = () => {
  const selectedImage = editImage.files[0];
  if (selectedImage) {
    document.getElementById("current-img").style.display = "none";
  } else {
    document.getElementById("current-img").style.display = "block";
  }
  console.log("selectedImage", selectedImage);
};
