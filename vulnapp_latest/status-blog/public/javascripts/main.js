// front end js

console.log("hello");
document.addEventListener("DOMContentLoaded", () => {
	console.log("loading status blogs..");

	document.querySelectorAll('.username').forEach((element) => {
		var username = element.innerText;
		fetch(`/users?request=status%3fusername%3d${username}`).then(response => response.text()).then(status => {
			console.log(username, status);
			document.getElementById(username).innerHTML += `: ${status}`;
		});
	})
	

});
