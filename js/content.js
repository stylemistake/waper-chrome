$(document).ready( function() {

	// Change favicon
	(function() {
		var link = document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'shortcut icon';
		link.href = chrome.extension.getURL("assets/icon.png");
		document.head.appendChild(link);
	})();

	// Strip common ads and counters
	$("div.ad").remove();
	$("a[href*='waplog']").parent().hide();

	// Remove the eye-teasing orange background from the "Back to chat" banner
	(function() {
		var chatDiv = $('div.info:contains("В чат")');
		chatDiv.removeClass('info');
		chatDiv.addClass('btm')
	})();

	// Replace all foreign links with direct links
	$("a[href*='/go/?u=']").each( function() {
		var url = $(this).attr("href").match(/\?u=(.*)/)[1];
		url = decodeURIComponent( url );
		$(this).attr( "href", url );
		$(this).attr( "target", "_blank" );
	});

	// Send current group to the background process
	(function() {

		var $link, link;

		$("a[href^='/group/']").each( function() {
			var tl = $(this).attr("href").match(/\/group\/([0-9]+)/);
			if ( tl !== null && tl.length >= 2 ) {
				$link = $(this);
				link = $link.attr("href");
				return false;
			}
		});

		function sendGroup( group ) {
			if ( group.name == "В сообщество" ) group.name = undefined;
			if ( group.id == 1 ) group.name = "Siemens-Club";
			chrome.runtime.sendMessage({ group: group });
		}

		if ( location.href.match(/\/group\/[0-9]+$/) !== null ) {
			sendGroup({
				id: location.href.match(/\/group\/([0-9]+)/)[1],
				name: $(".tp").html()
			});
			return true;
		}

		if ( location.href.match(/\/forum\//) !== null && link !== undefined ) {
			sendGroup({
				id: link.match(/\/group\/([0-9]+)/)[1],
				name: $link.html()
			});
			return true;
		}

	})();

	// Send visible posts to the background process
	(function() {
		if ( location.href.match(/\/forum\/topic\/[0-9]+/) !== null ) {
			var posts = [];
			$("a[name]").each( function() {
				var post_id = $(this).attr("name");
				if ( $.isNumeric( post_id ) ) posts.push( parseInt( post_id ) );
			});
			chrome.runtime.sendMessage({ posts: posts });
		}
	})();

	// Initialize SCEditor
	(function() {
		var urlsRE = /http:\/\/waper.ru\/r\/.+|http:\/\/waper.ru\/office\/talk\/.+|http:\/\/waper.ru\/office\/group\/forum\/write\/.+/
		if (urlsRE.test(window.location.href)) {
			$("textarea").sceditor({
				plugins: "bbcode",
				toolbar: "bold,italic,strike|code,image,link|time,date|maximize,source",
				style: chrome.extension.getURL("css/sceditor-content.css"),
				locale: "ru",
				emoticons: {
				}
			})
		}
	})();

});
