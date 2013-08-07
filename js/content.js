(function() {

	$(document).ready( function() {

		// Change favicon
		(function() {
			var link = document.createElement('link');
			link.type = 'image/x-icon';
			link.rel = 'shortcut icon';
			link.href = chrome.extension.getURL("assets/icon.png");
			document.head.appendChild(link);
		})();

		// Bind an event to all anchors with "go.php" in it.
		$("a[href*='/go/?u=']").on( "click", function( event ) {
			var url = $(this).attr("href").match(/\?u=(.*)/)[1];
			url = decodeURIComponent( url );
			if ( url.search("waper.ru") < 0 ) {
				event.preventDefault();
				window.open( url, "_blank" ).focus();
			}
		});

	});

})();