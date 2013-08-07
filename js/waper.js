var Waper = (function() {

	// Start if jQuery is defined
	// otherwise notify user about that via console
	if ( typeof jQuery == 'undefined' ) throw new Error("jQuery is required; check the script order.");


	var version = {
		major: 0,
		minor: 3,
		changes: [
			"[add] Меню конфигурации",
			"[add] Загрузка текста сообщений в оповещения",
			"[add] Оптимизация запросов",
			"[fix] Мелкие багфиксы",
		],
		url: "http://waper.ru/forum/topic/771266?pid=21782755"
	};



	var base_url = "http://waper.ru";

	var config = {
		update_interval: 10000,
		enable_inbox_checks: true,
		enable_forum_checks: true,
	};

	var events = {};


	chrome.storage.sync.get( "config", function( data ) {
		if ( data.config !== undefined ) {
			config = data.config;
			console.log("Configuration loaded!");
		}
	});


	function request( method, resource, data, success, failure ) {
		// THIS IS FOR: request( method, url, success, failure )
		if ( typeof data === "function" ) { failure = success; success = data; }

		if ( success === undefined ) success = function(){};
		if ( failure === undefined ) failure = function( data ) {
			console.log( "error: " + data.message );
		};

		$.ajax({
			url: base_url + resource,
			type: method,
			data: data,
			timeout: 15000,
			success: success,
			error: function( a, b, c ) {
				try {
					var data = $.parseJSON( a.responseText );
					failure( data );
				} catch( e ) {
					failure( c );
				}
			}
		});
	}

	function fireEvent( name, data ) {
		if ( ! events[name] ) events[name] = [];
		$.each( events[name], function( i, fun ) {
			fun( data );
		});
	}

	function bindEvent( name, fun ) {
		if ( ! events[name] ) events[name] = [];
		events[name].push( fun );
	}



	var side_context = document.implementation.createHTMLDocument('');

	var rss = {};
	var notif_persist = {
		posts: [],
		messages: [],
	};

	function getSimpleNotifications( callback ) {
		if ( callback === undefined ) callback = function(){};
		request( "GET", "/office/", function( data ) {
			var $html = $( data, side_context );
			var messages = $html.find("a[href='/office/talk/inbox/']").text().match(/[0-9]+/);
			var posts    = $html.find("a[href='/office/notify/']").text().match(/[0-9]+/);

			var info = {
				post_count: posts === null ? 0 : parseInt( posts[0] ),
				message_count: messages === null ? 0 : parseInt( messages[0] ),
			};
			console.log( info );

			fireEvent( 'notifications_available', info );
			callback( info );
		});
	}

	function getForumNotifications() {
		request( "GET", "/office/notify/", function( data ) {
			var $body = $( data, side_context ).filter(".body");
			var $posts = $body.find("a[href*='/forum/post/']");

			$posts.each( function() {
				var notif_data = {
					id: $(this).attr("href").match(/[0-9]+/)[0],
					url: base_url + $(this).attr("href"),
					name: $(this).next()[0].previousSibling.nodeValue.trim(),
				}
				if ( notif_persist.posts.indexOf( notif_data.id ) < 0 ) {
					notif_persist.posts.push( notif_data.id );
					request( "GET", "/r/p.r/", { pid: notif_data.id }, function( data ) {
						var $tpanel = $( data, side_context ).filter(".tpanel");
						var $body = $( data, side_context ).filter(".body");

						var sender = $tpanel.find("a[href*='/user/']").text();

						notif_data.message = $body.find(".mpanel").text().match(/:\s?(.*)/)[1];
						notif_data.name = sender + " (" + notif_data.name + ")";
						fireEvent( 'new_post', notif_data );
					});
				}
			});

		});
	}

	function getInboxNotifications( limit ) {
		if ( limit === undefined ) limit = 10;
		request( "GET", rss.messages, function( data ) {
			var $items = $( data, side_context ).find("item");
			$items.each( function() {
				var notif_data = {
					id: $(this).find("guid").text().match(/[0-9]+/)[0],
					url: base_url + "/office/talk/inbox/",
					//name: $(this).find("title").text().match(/\s(.+)/)[1],
					name: "Сообщение " + $(this).find("title").text(),
					message: $(this).find("description").text().trim()
				}
				if ( limit-- <= 0 ) return true;
				if ( notif_persist.messages.indexOf( notif_data.id ) < 0 ) {
					notif_persist.messages.push( notif_data.id );
					fireEvent( 'new_message', notif_data );
				}
			});
		});
	}

	function getRSS( callback ) {
		if ( callback === undefined ) callback = function(){};
		if ( rss.messages !== undefined ) { callback(); return true; }
		chrome.storage.sync.get( "rss", function( data ) {
			if ( data.rss === undefined ) {
				request( "GET", "/r/ib.r", function( data ) {
					var $rss = $( data, side_context ).find("a[href*='/rss/private/inbox']");
					rss.messages = $rss.attr("href");
					chrome.storage.sync.set({ rss: rss }, function() {
						console.log("RSS retrieved!");
						callback();
					});
				});
			} else {
				rss.messages = data.rss.messages;
				console.log("RSS loaded!");
				callback();
			}
		});
	}

	$(document).ready( function() {
		(function loop() {
			getSimpleNotifications( function() {
				setTimeout( loop, 10000 );
			});
		})();
	})

	bindEvent( 'notifications_available', function( info ) {
		if ( info.post_count > 0 && config.enable_forum_checks ) {
			getForumNotifications();
		}
		getRSS( function() {
			if ( info.message_count > 0 && config.enable_inbox_checks ) {
				getInboxNotifications( info.message_count );
			}
		});
	});

	return {
		base_url: base_url,
		request: request,
		events: events,
		bind: bindEvent,
		getConfig: function() { return config; },
		setConfig: function( new_conf ) {
			chrome.storage.sync.set({ config: new_conf }, function() {
				config = new_conf;
				console.log("Configuration saved.");
			});
		},
		version: version
	};

})();