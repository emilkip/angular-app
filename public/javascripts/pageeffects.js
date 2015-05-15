$(document).ready(function() {

	$('#login').click(function() {
		$('.auth-block').toggleClass('auth-active');
	});

	$('#profile').click(function() {
		$('.profile-block').toggleClass('profile-active');
	});
});