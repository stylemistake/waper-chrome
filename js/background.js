(function() {


	// Version notifications
	var version = Waper.version;
	var config = Waper.getConfig();
	var base_url = Waper.base_url;

	chrome.storage.sync.get( "version", function( data ) {
		if ( data.version === undefined || data.version.major < version.major || data.version.minor < version.minor ) {
			notify(
				"Обновлено до версии " + version.major + "." + version.minor,
				version.changes.join("\r\n"),
				version.url
			);
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

	function notify( name, msg, url, timeout ) {
		var n = webkitNotifications.createNotification( 'assets/icon_128.png', name, msg );
		n.show();
		n.onclick = function() {
			n.cancel();
			notification_count--;
			updateBadge();
			if ( url !== undefined ) focus( url );
		};
		if ( timeout !== undefined ) setTimeout( function() { n.cancel() }, timeout );
		return n;
	}


	var notification_count = 0;

	function updateBadge() {
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
		config = Waper.getConfig();
		notification_count = info.post_count + info.message_count;
		if ( ! config.enable_inbox_checks && info_persist.message_count < info.message_count ) {
			notify( info.message_count + " сообщ. (ЛС)", "", base_url + "/r/ib.r", 9500 );
		}
		if ( ! config.enable_forum_checks && info_persist.post_count < info.post_count ) {
			notify( info.post_count + " отв. в теме", "", base_url + "/office/notify/", 9500 );
		}
		info_persist = info;
		updateBadge();
	});

	Waper.bind( 'new_post', function( data ) {
		notify( data.name, data.message, data.url );
	});

	Waper.bind( 'new_message', function( data ) {
		notify( data.name, data.message, data.url );
	});

	Waper.bind( 'new_group_topic', function( data ) {
		notify( data.name, data.message, data.url, 9500 );
	});

	Waper.bind( 'new_group_post', function( data ) {
		notify( data.name, data.message, data.url, 9500 );
	});



})();