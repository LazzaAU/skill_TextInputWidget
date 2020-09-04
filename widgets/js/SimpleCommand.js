$(function () {
	let savedToken = '';
	let topics = [
		'hermes/dialogueManager/sessionEnded'
	]

	function login(user, pin) {
		let form = new FormData();
		form.append('username', user);
		form.append('pin', pin);

		let settings = {
			'url': '/api/v1.0.1/login/',
			'method': 'POST',
			'timeout': 0,
			'processData': false,
			'mimeType': 'multipart/form-data',
			'contentType': false,
			'data': form
		};

		$.ajax(settings).done(function (response) {
			let json = JSON.parse(response);
			savedToken = json['apiToken'];
			if(!savedToken){
				alert(json['message']);
				return;
			}
			$('#TextInputWidget_login').hide();
			$('#TextInputWidget_query').show()
		});

	}

	function process(token, siteID, qry, sessionId) {
		let url = "";
		if( sessionId == "" ){
			url = '/api/v1.0.1/dialog/process/';
		} else {
			console.log(sessionId)
			url = '/api/v1.0.1/dialog/continue/';
		}
		let form = new FormData();
		form.append('query', qry);
		form.append('siteId', siteID);
		form.append('sessionId', sessionId);
		let settings = {
			'url': url,
			'method': 'POST',
			'timeout': 0,
			'headers': {
				'auth': token
			},
			'processData': false,
			'mimeType': 'multipart/form-data',
			'contentType': false,
			'dataType': 'json',
			'data': form
		};

		$.ajax(settings).done(function (response) {
			$('#sessionId').val(response['sessionId']);
		});
	}

	$('#login').on('click', function () {
		login($('#username').val(), $('#pin').val());
	});

	$('#logout').on('click touchstart', function () {
		savedToken = '';
		$('#TextInputWidget_login').show();
		$('#TextInputWidget_query').hide();
	});

	$('#process').on('click touchstart', function () {
		process(savedToken, $('#siteID').val(), $('#qry').val(), $('#sessionId').val());
	});

	$('#qry').on('keydown', function(e) {
		if (e.key == "Enter") {
			process(savedToken, $('#siteID').val(), $('#qry').val(), $('#sessionId').val());
		}
	});

	$('#pin').on('keydown', function(e) {
		if (e.key == "Enter") {
			login($('#username').val(), $('#pin').val());
		}
	});

	function onConnect() {
		for (const topic in topics) {
			MQTT.subscribe(topic);
		}
	}

	function onMessage(msg) {
		if (!topics.includes(msg.topic) || !msg.payloadString) {
			return;
		}
		//msg to json, get 'text'
		let json = JSON.parse(msg.payloadString);
		if (msg.destinationName == 'hermes/dialogueManager/sessionEnded') {
			if( $('#sessionId').val() == json['sessionId'] ){
				$('#sessionId').val("");
			}
		}
	}

	mqttRegisterSelf(onConnect, 'onConnect');
	mqttRegisterSelf(onMessage, 'onMessage');

	if( $('#username').val() != '' && $('#pin').val() != ''){
		login($('#username').val(), $('#pin').val());
	}
});
