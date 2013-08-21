(function() {


	// Version notifications
	var version = Waper.version;
	var config = Waper.getConfig();
	var base_url = Waper.base_url;

	chrome.storage.sync.get( "version", function( data ) {
		if ( data.version === undefined || data.version.major < version.major || data.version.minor < version.minor ) {
			notify({
				name: "Обновлено до версии " + version.major + "." + version.minor,
				message: version.changes.join("\r\n"),
				url: version.url
			});
			chrome.storage.sync.set({ "version": version });
		}
	});


	// When clicked on icon, focus to the near Waper tab
	// otherwise create one

	function focus( url ) {
		chrome.tabs.query( { url: base_url + "/*" }, function( tabs ) {
			if ( url === undefined ) {
				if ( tabs[0] != undefined ) chrome.tabs.update( tabs[0].id, { selected: true } );
				else chrome.tabs.create({ url: base_url + "/office/" });
			} else {
				if ( tabs[0] != undefined ) chrome.tabs.update( tabs[0].id, { selected: true, url: url } );
				else chrome.tabs.create({ url: url });
			}
		});
	}

	function notify( data, timeout ) {
		if ( data.icon === undefined ) data.icon = 'assets/icon_128.png';
		var n = webkitNotifications.createNotification( data.icon, data.name, data.message );
		n.show();
		n.onclick = function() {
			n.cancel();
			notification_count--;
			updateBadge();
			if ( data.url !== undefined ) focus( data.url );
		};
		if ( timeout !== undefined ) setTimeout( function() { n.cancel() }, timeout );
		return n;
	}


	var notification_count = 0;

	function updateBadge() {
		chrome.browserAction.setBadgeBackgroundColor({ color: [ 0, 0, 0, 0 ] });
		if ( notification_count <= 0 ) {
			chrome.browserAction.setBadgeText({ text: "" });
		} else {
			chrome.browserAction.setBadgeText({ text: "" + notification_count });
		}
	}



	// chrome.browserAction.onClicked.addListener( function() {
	// 	focus();
	// });

	var info_persist = { post_count: 0, message_count: 0 };

	Waper.bind( 'notifications_available', function( info ) {
		var data = { icon: 'assets/icon_128_gray.png', message: "" };
		config = Waper.getConfig();
		notification_count = info.post_count + info.message_count;
		if ( ! config.enable_inbox_checks && info_persist.message_count < info.message_count ) {
			data.name = info.message_count + " сообщ. (ЛС)";
			data.url = base_url + "/r/ib.r";
			notify( data, 9500 );
		}
		if ( ! config.enable_forum_checks && info_persist.post_count < info.post_count ) {
			data.name = info.post_count + " отв. в теме";
			data.url = base_url + "/office/notify/";
			notify( data, 9500 );
		}
		info_persist = info;
		updateBadge();
	});

	// Hint, when waper.ru is unavailable
	Waper.bind( 'notifications_error', function() {
		chrome.browserAction.setBadgeBackgroundColor({ color: [ 90, 90, 90, 255 ] });
		chrome.browserAction.setIcon({ path: 'assets/icon_128_gray.png' });
		chrome.browserAction.setBadgeText({ text: "?" });
	});

	Waper.bind( 'notifications_received', function() {
		chrome.browserAction.setIcon({ path: 'assets/icon.png' });
		updateBadge();
	})

	Waper.bind( 'new_post', function( data ) {
		notify( data );
	});

	Waper.bind( 'new_message', function( data ) {
		notify( data );
	});

	Waper.bind( 'new_group_topic', function( data ) {
		data.icon = 'assets/icon_128_gray.png';
		notify( data, 9500 );
	});

	Waper.bind( 'new_group_post', function( data ) {
		data.icon = 'assets/icon_128_gray.png';
		notify( data, 9500 );
	});



})();