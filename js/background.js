(function() {

	// When clicked on icon, focus to the near Waper tab
	// otherwise create one
	chrome.browserAction.onClicked.addListener( function() {
		chrome.tabs.query( { url: "http://waper.ru/*" }, function( tabs ) {
			if ( tabs[0] != undefined ) chrome.tabs.update( tabs[0].id, { selected: true } );
			else chrome.tabs.create({ url: "http://waper.ru/office/" });
		});
	});

	function notify( name, msg, url ) {
		var n = webkitNotifications.createNotification( 'icon_128.png', name, msg );
		n.show();
		n.onclick = function() {
			n.cancel();
			chrome.tabs.create({ url: url });
		};
		//setTimeout( function() { n.cancel() }, 4500 );
	}

	function setBadge( text ) {
		if ( text == 0 ) {
			chrome.browserAction.setBadgeText({ text: "" });
		} else {
			chrome.browserAction.setBadgeText({ text: ""+text });
		}
	}

	Waper.bind( 'new_post', function( data ) {
		notify( data.name, data.message, data.url );
	});

	Waper.bind( 'new_message', function( data ) {
		notify( data.name, data.message, data.url );
	});


})();