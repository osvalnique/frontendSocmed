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

async function userStatus() {
  const response = await fetch("http://127.0.0.1:5000/user/status", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  let status = await response.json();
  console.log(status);
  return status;
}
userStatus();

function getStatus() {}
