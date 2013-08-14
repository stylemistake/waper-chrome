var Helpers = {
	getDateDiff: function( date1, date2 ) {
		if ( date2 === undefined ) date2 = (new Date()).getTime();
		console.log( date1, date2, date2 - date1 );
		return date2 - date1;
	}
}