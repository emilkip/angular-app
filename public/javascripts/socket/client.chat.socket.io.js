$(document).ready(function() {

// Socket io (chat)
	var socket = io(location.host);

	function chatContScrollToBottom() {
		var chatElem = document.getElementById('chat-cont');
		chatElem.scrollTop = chatElem.scrollHeight;
	}

	$("#chat").submit(function(e) {
		e.preventDefault();
		socket.emit('Msg', $("#inpMsg").val().replace(/<\/?[^>]+>/g,' '));
		this.reset();
	});

	socket.on('OnlineList', function(userlist) {
		$('ul#online-user').empty();
		userlist.forEach(function(item, i, arr) {
			$('ul#online-user').append('<li id="' + userlist[i].username + '">' + userlist[i].username + '</li>');
		});
	});

	socket.on('MsgHistory', function(msgHistory) {


		msgHistory.forEach(function(item, i, arr) {

			var $msgTemplate = '<div class="chat-msg-cont cf"><div class="chat-user-info"><img src="/images/useravatar/350x350/' + msgHistory[i].authorAvatar + '">' + '<h4>' + msgHistory[i].author + '</h4>' + '</div>' + '<div class="chat-msg"><p>' + msgHistory[i].message + '</p>' + '<div class="chat-msg-time">' + msgHistory[i].msgTime + '</div>' +  '</div>';

			$('#chat-cont').append($msgTemplate).children(':last');
			chatContScrollToBottom();
		});
	});

	socket.on('Msg', function(username, avatar, date, msg) {

		var $msgTemplate = '<div class="chat-msg-cont cf"><div class="chat-user-info"><img src="/images/useravatar/350x350/' + avatar + '">' + '<h4>' + username + '</h4>' + '</div>' + '<div class="chat-msg"><p>' + msg + '</p>' + '<div class="chat-msg-time">' + date + '</div>' +  '</div>';

		$('#chat-cont').append($msgTemplate).children(':last').hide().fadeIn(300);
		chatContScrollToBottom();
	});

});