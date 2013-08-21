$.fn.accessibleText = function() {
	if ( this.is('img') ) {
		return this.attr( 'alt' );
	} else if ( this.is('input') ) {
		return this.attr( 'value' );
	} else {
		return $.map( this.contents(), function( domElement ) {
			if ( domElement.nodeType === 3 ) {
				return domElement.data;
			} else if ( domElement.nodeType === 1 ) {
				var $element = $( domElement );
				if ( $element.is( 'img, imput' ) || $element.find( 'img[alt], input[value]' ).length > 0 ) {
					return $element.accessibleText();
				} else {
					return $element.text();
				}
			}
		}).join('');
	}
};
