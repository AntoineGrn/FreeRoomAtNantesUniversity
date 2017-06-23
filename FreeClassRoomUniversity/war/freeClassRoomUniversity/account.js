var html;

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  html = $(".g-signin2").html();
  $(".g-signin2").html('<a href="#" onclick="signOut();">Déconnexion</a><input id="#userId" type="hidden" value=' + profile.getId() + ' />');
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
	  $(".g-signin2").html(html);
  });
}