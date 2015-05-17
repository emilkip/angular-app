$(document).ready(function() {

	$('#login').click(function() {
		$('.auth-block').toggleClass('auth-active');
	});

	$('#profile').click(function() {
		$('.profile-block').toggleClass('profile-active');
	});

	function showImg(inputPhoto) {
		if (inputPhoto.files && inputPhoto.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$('#new-photo').attr('src', e.target.result);
			}
			reader.readAsDataURL(inputPhoto.files[0]);
		}
	}

	$("#inp-new-photo").change(function(){
		showImg(this);
	});
});