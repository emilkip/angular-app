$(window).load(function() {
	$('.status').fadeOut();
	$('.preloader').delay(350).fadeOut('slow');
	$('body').delay(350).css({'overflow':'visible'});
});

$(document).ready(function() {

// Login dropdown form
// ------------------------------------------------------
	$('#login').click(function() {
		$('.auth-block').toggleClass('auth-active');
	});
	$('#profile').click(function() {
		$('.profile-block').toggleClass('profile-active');
	});

// Profile block image
// ------------------------------------------------------
	var avatarImg = document.querySelector('.avatar-img');
	var $avatarImg = $('.avatar-img');

	function imageCenter(img, jimg) {
		if(img) {
			if (img.clientWidth == img.clientHeight) {
				jimg.addClass('square-img');
			} else if(img.clientWidth > img.clientHeight) {
				jimg.addClass('horizontal-center');
			} else {
				jimg.addClass('vertical-center');
			}
		}
	}
	imageCenter(avatarImg,$avatarImg);

// Change photo preview
// ------------------------------------------------------
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

	$('.modal-window-wrap').click(function() {
		var avatarInput = $('#inp-new-photo');
		avatarInput.replaceWith(avatarInput.val('').clone( true ));
		$('#new-photo').attr('src', '/images/default-placeholder.png');
		$('body').css('overflow', 'scroll');
	});

	$('.avatar-change-btn').click(function() {
		$('body').css('overflow', 'hidden');
	});

	$('.modal-window').css('display','block');
	$('.modal-window-wrap').css('display','block');

// 
// ------------------------------------------------------

});