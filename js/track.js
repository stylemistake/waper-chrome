var _gaq = _gaq || [];
var Track = {}
_gaq.push(['_setAccount', 'UA-12842516-2']);

(function() {

	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

	function getAppData() {
		if ( Track.app_data === undefined ) return false;
		else return (
			"/v" + Track.app_data.version +
			"/"  + Track.app_data.userid
		);
	}

	Track.app = function() {
		if ( getAppData() === false ) return false;
		try {
			_gaq.push([ "_trackPageview", getAppData() ]);
		} catch ( e ) {
			console.log( e );
		}
		return true;
	};

	Track.event = function( category, action, label ) {
		if ( getAppData() === false ) return false;
		try {
			_gaq.push([ "_trackEvent", category, action, getAppData() + ": " + label ]);
		} catch ( e ) {
			console.log( e );
		}
		return true;
	};

})();