var Waper = (function() {

	// Start if jQuery is defined
	// otherwise notify user about that via console
	if ( typeof jQuery == 'undefined' ) throw new Error("jQuery is required; check the script order.");

	var version = {
		major: 0,
		minor: 5,
		changes: [
			"[add] WysiBB редактор",
			"[add] Вырезание рекламы",
			"[add] Подписки на сообщества",
			"[fix] Выпрямление ссылок без биндов на клик",
			"[fix] Нотификации теперь не должны застрявать"
		],
		url: "http://waper.ru/forum/topic/771266"
	};

	var base_url = "http://waper.ru";

	var config = {
		update_interval: 8000,
		enable_inbox_checks: true,
		enable_forum_checks: true,
		enable_analytics: true,
		subscriptions: {},
		subscr_update_interval: 30000,
	};

	var events = {};

	var friends_online = [];


	// Always know about the current group user stays in
	var current_group = {};
	chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {
		if ( request.group !== undefined && request.group.name !== undefined ) {
			current_group = request.group;
		}
		if ( request.posts !== undefined ) {
			$.each( request.posts, function( key, value ) {
				if ( notif_persist.posts.indexOf( value ) < 0 ) {
					notif_persist.posts.push( value );
				}
			});
		}
	});

	// Load config and sync in a background loop
	chrome.storage.sync.get( "config", function( data ) {
		if ( data.config !== undefined ) {
			$.each( data.config, function( key, value ) {
				config[key] = value;
				console.log( "config: loaded " + key );
			});
		}

		(function loop() {
			chrome.storage.sync.set({ config: config }, function() {});
			setTimeout( loop, 30000 );
		})();
	});

	function request( method, resource, data, success, failure ) {
		// THIS IS FOR: request( method, url, success, failure )
		if ( typeof data === "function" ) { failure = success; success = data; }

		if ( success === undefined ) success = function(){};
		if ( failure === undefined ) failure = function( data ) {
			console.log( "error: " + data.message );
		};
		return $.ajax({
			url: base_url + resource,
			type: method,
			data: data,
			timeout: 15000,
			success: success,
			error: function( a, b, c ) {
				try {
					var data = $.parseJSON( a.responseText );
					failure( data );
				} catch (e) {
					failure( b );
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
		topics: [],
		messages: [],
		friends_online: [],
	};
	var info_persist = {};

	function getSimpleNotifications( callback, fallback ) {
		if ( callback === undefined ) callback = function(){};
		return request( "GET", "/office/", function( data ) {
			var $html = $( data, side_context );
			var messages  = $html.find("a[href='/office/talk/inbox/']").text().match(/[0-9]+/);
			var posts     = $html.find("a[href='/office/notify/']").text().match(/[0-9]+/);
			var userid    = $html.find("a[href*='/user/friend/']").attr("href");

			var info = {
				post_count: posts === null ? 0 : parseInt( posts[0] ),
				message_count: messages === null ? 0 : parseInt( messages[0] ),
				userid: userid === undefined ? "logged_out" : userid.match(/[0-9]+/)[0],
				username: $html.find("a[href='/office/']").text(),
			};

			Track.app_data = {
				version: version.major + "." + version.minor,
				userid: info.userid
			};

			fireEvent( 'notifications_available', info );
			callback( info );
		}, fallback );
	}

	function getForumNotifications() {
		return request( "GET", "/office/notify/", function( data ) {
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
						notif_data.name = sender + " " + notif_data.name;
						fireEvent( 'new_post', notif_data );
					});
				}
			});
		});
	}

	function getInboxNotifications( limit ) {
		if ( limit === undefined ) limit = 10;
		return request( "GET", rss.messages, function( data ) {
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

	// function getOnlineFriends() {
	// 	request( "GET", "/office/friend/online.php", function( data ) {
	// 		var $body  = $( data, side_context ).filter(".body");
	// 		var $items = $body.find("a[href*='/user/']");
	// 		friends_online = [];

	// 		$items.each( function() {
	// 			var notif_data = {
	// 				id: $(this).attr("href").match(/[0-9]+/)[0],
	// 				url: $(this).attr("href"),
	// 				name: $(this).text(),
	// 				message: "Online",
	// 				location: {
	// 					name: $(this).next().text(),
	// 					url: $(this).next().attr("href")
	// 				},
	// 			};
	// 			friends_online.push( notif_data );
	// 			console.log( notif_data );
	// 		});

	// 		$.each( friends_online, function( key, value ) {
	// 			if ( value) else {
	// 				fireEvent( 'friend_offline', notif_data );
	// 				console.log( notif_data );
	// 			}
	// 		});
	// 	});
	// }

	function getGroupTopicNotifications( subscr_data ) {
		return request( "GET", "/rss/topic" + subscr_data.group_id + ".xml", function( data ) {
			var $xml = $( data, side_context );
			var $items = $xml.find("item");
			var title = $( $xml.find("title")[0] ).text().match(/"(.*?)"/)[1];
			$items.each( function() {
				var notif_data = {
					id: $(this).find("guid").text().match(/[0-9]+/)[0],
					url: $(this).find("guid").text(),
					name: "Новая тема в " + title,
					message: $(this).find("title").text().trim()
				};
				if ( notif_persist.topics.indexOf( notif_data.id ) < 0 ) {
					notif_persist.topics.push( notif_data.id );
					var date = subscr_data.date_updated;
					if ( date !== undefined && Helpers.getDateDiff( date ) > config.subscr_update_interval ) {
						fireEvent( 'new_group_topic', notif_data );
					}
				}
			});
			subscr_data.date_updated = (new Date()).getTime() - 1500;
		});
	}

	function getGroupPostNotifications( subscr_data ) {
		return request( "GET", "/rss/post" + subscr_data.group_id + ".xml", function( data ) {
			var $xml = $( data, side_context );
			var $items = $xml.find("item");
			$items.each( function() {
				var notif_data = {
					id: $(this).find("guid").text().match(/[0-9]+/)[0],
					url: $(this).find("guid").text(),
					name: $(this).find("title").text().trim().match(/от\s(.*)/)[1],
					message: $(this).find("description").text().trim().replace(/(<([^>]+)>)/ig,"")
				};
				if ( notif_persist.posts.indexOf( notif_data.id ) < 0 ) {
					notif_persist.posts.push( notif_data.id );
					var date = subscr_data.date_updated;
					if ( date !== undefined && Helpers.getDateDiff( date ) >= config.subscr_update_interval ) {
						fireEvent( 'new_group_post', notif_data );
					}
				}
			});
			subscr_data.date_updated = (new Date()).getTime() - 1500;
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
						callback();
					});
				});
			} else {
				rss.messages = data.rss.messages;
				callback();
			}
		});
	}



	$(document).ready( function() {

		// Notification loop
		(function loop() {
			getSimpleNotifications( function() {
				fireEvent( 'notifications_received' );
				setTimeout( loop, config.update_interval );
			}, function() {
				fireEvent( 'notifications_error' );
				setTimeout( loop, config.update_interval );
			});
		})();

		// Subscription loop
		(function loop() {
			var defs = [];
			for ( var i in config.subscriptions ) {
				var data = config.subscriptions[i];
				if ( data.receive_topics ) defs.push( getGroupTopicNotifications( data ) );
				if ( data.receive_posts  ) defs.push( getGroupPostNotifications( data ) );
			}
			$.when.apply( $, defs ).then( function() {
				setTimeout( loop, config.subscr_update_interval );
			}, function() {
				console.log("subscriptions: error");
				setTimeout( loop, config.subscr_update_interval );
			});
		})();

		// Analytics loop
		(function loop() {
			if ( config.enable_analytics ) {
				var status = Track.app();
				if ( status ) { setTimeout( loop, 60000 ); return true; }
			}
			setTimeout( loop, 5000 );
		})();

	});

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
			});
		},
		getCurrentGroup: function() { return current_group; },
		reset: function() {
			chrome.storage.sync.clear();
			window.location.reload();
		},
		version: version
	};

})();