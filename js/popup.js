var bg = chrome.extension.getBackgroundPage();

(function() {

	var config = bg.Waper.getConfig();
	var version = bg.Waper.version;
	var group = bg.Waper.getCurrentGroup();

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

	$(document).ready( function() {

		// Initialization
		$("#version").html( version.major + "." + version.minor );

		$("#reset").on( "click", function( event ) {
			if ( confirm("Вы уверены, что хотите сбросить все настройки?") ) {
				bg.Waper.reset();
				window.close();
			}
		});

		$("div.item.link").on( "click", function() {
			var url = $(this).attr("data-href");
			focus( url );
		});


		// Configuration items

		$("#config div.item.checkbox").each( function() {
			var param = $(this).attr("data-param");
			$(this).toggleClass( "active", config[param] );
		});

		$("#config div.item.checkbox").on( "click", function() {
			var param = $(this).attr("data-param");
			var value = $(this).hasClass("active");
			config[param] = !value;
			$(this).toggleClass( "active", config[param] );
			bg.Track.event( "Popup", "Change settings", param + " - " + ( value ? "disabled" : "enabled" ) );
			bg.Waper.setConfig( config );
		});


		// Subscription items

		if ( group.id !== undefined ) {
			$("#subscriptions").show();
			var sub = config.subscriptions[ group.id ];
			$("#group_link").attr( "data-href", "http://waper.ru/group/" + group.id );
			$("#group_link").html( "<b>Сообщество:</b> " + group.name );

			if ( sub !== undefined ) {
				$("#subscriptions div.item.checkbox").each( function() {
					var param = $(this).attr("data-param");
					$(this).toggleClass( "active", sub[param] );
				});
			}

			$("#subscriptions div.item.checkbox").on( "click", function() {
				sub = {
					group_id: group.id,
					receive_posts: false,
					receive_topics: false,
					date_updated: (new Date).getTime()
				};
				var param = $(this).attr("data-param");
				var value = $(this).hasClass("active");
				if ( ! value ) $("#subscriptions div.item.checkbox").toggleClass( "active", false );
				sub[param] = !value;
				config.subscriptions[ group.id ] = sub;
				$(this).toggleClass( "active", config[param] );
				bg.Track.event( "Popup", "Subscription", group.id + " - " + param + " - " + ( value ? "disabled" : "enabled" ) );
				bg.Waper.setConfig( config );
			});
		}

	});

})();