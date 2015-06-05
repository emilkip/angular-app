$(document).ready(function() {

// Login dropdown form
	$('#login').click(function() {
		$('.auth-block').toggleClass('auth-active');
	});

	$('#profile').click(function() {
		$('.profile-block').toggleClass('profile-active');
	});

// Change photo preview
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

// Socket io (chat)
	var socket = io(location.host);

	function chatContScrollToBottom() {
		var chatElem = document.getElementById('chat-cont');
		chatElem.scrollTop = chatElem.scrollHeight;
	}

	$("#chat").submit(function(e) {
		e.preventDefault();
		socket.emit('Msg', $("#inpMsg").val());
		this.reset();
	});

	socket.on('OnlineList', function(userlist) {
		$('ul#online-user').empty();
		userlist.forEach(function(item, i, arr) {
			$('ul#online-user').append('<li id="' + userlist[i].username + '">' + userlist[i].username + '</li>').children(':last').hide().fadeIn(300);
		});
	});

	socket.on('Msg', function(username, avatar, date, msg) {
		var $msgTemplate = '<div class="chat-msg-cont cf"><div class="chat-user-info"><img src="/images/useravatar/350x350/' + avatar + '">' + '<h4>' + username + '</h4>' + '</div>' + '<div class="chat-msg"><p>' + msg + '</p>' + '<div class="chat-msg-time">' + date + '</div>' +  '</div>';

		$('#chat-cont').append($msgTemplate).children(':last').hide().fadeIn(300);
		chatContScrollToBottom();

	});
});