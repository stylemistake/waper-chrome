(function() {

	// Version notifications
	var version = {
		major: 0,
		minor: 2,
		changes: [
			"[add] Добавлен выпрямитель ссылок",
			"[fix] Исправлен баг с получением ЛС",
			"[fix] Увеличен интервал между проверками нотификаций",
		],
		url: "http://waper.ru/forum/post/21783277?ncl=1"
	}

	// chrome.browserAction.setBadgeText({ text: "" + version.major + "." + version.minor });

	chrome.storage.sync.get( "version", function( data ) {
		console.log( "version", data );
		if ( data.version === undefined || data.version.major < version.major || data.version.minor < version.minor ) {
			notify(
				"Обновлено до версии " + version.major + "." + version.minor,
				version.changes.join(" "),
				version.url
			);
			chrome.storage.sync.set({ "version": version });
		}
	});

	// When clicked on icon, focus to the near Waper tab
	// otherwise create one

	function focus( url ) {
		chrome.tabs.query( { url: "http://waper.ru/*" }, function( tabs ) {
			if ( url === undefined ) {
				if ( tabs[0] != undefined ) chrome.tabs.update( tabs[0].id, { selected: true } );
				else chrome.tabs.create({ url: "http://waper.ru/office/" });
			} else {
				if ( tabs[0] != undefined ) chrome.tabs.update( tabs[0].id, { selected: true, url: url } );
				else chrome.tabs.create({ url: url });
			}
		});
	}

	function notify( name, msg, url ) {
		var n = webkitNotifications.createNotification( 'icon_128.png', name, msg );
		n.show();
		n.onclick = function() {
			n.cancel();
			if ( url !== undefined ) focus( url );
		};
		//setTimeout( function() { n.cancel() }, 4500 );
		return n;
	}

	chrome.browserAction.onClicked.addListener( focus );

	Waper.bind( 'new_notification', function( data ) {
		notify( data.name, data.message, data.url );
	});


})();