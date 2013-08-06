var Waper = (function() {

	// Start if jQuery is defined
	// otherwise notify user about that via console
	if ( typeof jQuery == 'undefined' ) throw new Error("jQuery is required; check the script order.");


	var base_url = "http://waper.ru";

	var events = {};


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
			timeout: 14000,
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


	var side_context = document.implementation.createHTMLDocument('');
	var notif_persist = {
		posts: [],
		messages: [],
	};

	function getNotifications( alternativeURL ) {
		var url = "/office/notify/";
		if ( alternativeURL !== undefined ) url = alternativeURL;

		request( "GET", url, function( data ) {
			var $body = $( data, side_context ).filter(".body");

			var $messages = $body.find("a[href='/office/talk/inbox/']");
			var $posts = $body.find("a[href*='/forum/post/']");

			var $messages_inbox = $( data, side_context ).find("small.info");

			if ( window.datatoplay === undefined ) window.datatoplay = $( data, side_context );

			$posts.each( function() {
				var data = {
					id: $(this).attr("href").match(/[0-9]+/)[0],
					url: base_url + $(this).attr("href"),
					name: $(this).text(),
					message: $(this).next()[0].previousSibling.nodeValue,
				}
				if ( notif_persist.posts.indexOf( data.id ) < 0 ) {
					notif_persist.posts.push( data.id );
					fireEvent( 'new_notification', data );
				}
			});

			if ( $messages.length > 0 ) {
				getNotifications("/r/ib.r");
				return true;
			}

			$messages_inbox.each( function() {
				var $msg_body = $(this).parent().next();
				var data = {
					id: $msg_body.find("a").attr("href").match(/mid=([0-9]+)/)[1],
					url: base_url + $msg_body.find("a[href*='/office/talk/?id']").attr("href"),
					name: $(this).parent().find("a").text(),
					message: $msg_body.find("br")[0].previousSibling.nodeValue
				}
				console.log( data );
				if ( notif_persist.messages.indexOf( data.id ) < 0 ) {
					notif_persist.messages.push( data.id );
					fireEvent( 'new_notification', data );
				}
			});
		});
	}

	$(document).ready( function() {
		(function loop() {
			getNotifications();
			setTimeout( loop, 15000 );
		})();
	})

	return {
		base_url: base_url,
		request: request,
		events: events,
		bind: function( name, fun ) {
			if ( ! events[name] ) events[name] = [];
			events[name].push( fun );
		},
	};

})();