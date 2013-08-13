var bg = chrome.extension.getBackgroundPage();

(function() {

	var config = bg.Waper.getConfig();
	var version = bg.Waper.version;

	// function updateTraffic() {
	// 	var base_traffic = 430;
	// 	$("div.item.checkbox").each( function() {
	// 		var traffic = $(this).attr("data-traffic");
	// 		base_traffic += $(this).hasClass("active") ? parseInt(traffic) : 0;
	// 	});
	// 	$("#traffic").html( base_traffic );
	// }

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

		$("div.item.link").on( "click", function() {
			var url = $(this).attr("data-href");
			focus( url );
		});

		$("#config div.item.checkbox").each( function() {
			var param = $(this).attr("data-param");
			$(this).toggleClass( "active", config[param] );
		});

		// Action bindings
		$("#config div.item.checkbox").on( "click", function() {
			var param = $(this).attr("data-param");
			var value = $(this).hasClass("active");
			config[param] = !value;
			$(this).toggleClass( "active", config[param] );
			bg.Track.event( "Popup", "Change settings", param + " - " + ( value ? "disabled" : "enabled" ) );
			bg.Waper.setConfig( config );
		});

	});

})();