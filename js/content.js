(function() {

	$(document).ready( function() {

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