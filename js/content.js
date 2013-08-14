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

		console.log( link );

		function sendGroup( group ) {
			console.log( group );
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

	// Initialize the WysiBB editor
	(function() {
		var urlsRE = /http:\/\/waper.ru\/r\/.+|http:\/\/waper.ru\/office\/talk\/.+|http:\/\/waper.ru\/office\/group\/forum\/write\/.+/
		if (urlsRE.test(window.location.href)) {
			var bodyInnerHtml = $("body").html();
			var re = /<textarea.+textarea>/;
			var textareaCode = bodyInnerHtml.match(re)[0];
			var innerText = textareaCode.replace(
					'<textarea name="text" rows="10" style="width:95%;">', '').replace(
					'</textarea>', '');
			bodyInnerHtml = bodyInnerHtml.replace(
					textareaCode,
					'<textarea id="wbbeditor" name="text" style="min-height: 300px">' +
					innerText + '</textarea>');
			$("body").html(bodyInnerHtml);

			$('#wbbeditor').wysibb({
				buttons: 'bold,italic,strike,|,smilebox,|,img,link,code',
				img_uploadurl: 'http://www.wysibb.com/iupload.php',
				autoresize: false,
				imgupload: false,
				smileList: [
					{title: "-)", img: '<img src="http://waper.ru/smile/06.gif" class="sm">', bbcode: "-)"},
					{title: ";)", img: '<img src="http://waper.ru/smile/05.gif" class="sm">', bbcode: ";)"},
					{title: ";/", img: '<img src="http://waper.ru/smile/30.gif" class="sm">', bbcode: ";/"},
					{title: ":-(", img: '<img src="http://waper.ru/smile/08.gif" class="sm">', bbcode: ":-("},
					{title: ":-)", img: '<img src="http://waper.ru/smile/02.gif" class="sm">', bbcode: ":-)"},
					{title: ":-))", img: '<img src="http://waper.ru/smile/03.gif" class="sm">', bbcode: ":-))"},
					{title: ":-D", img: '<img src="http://waper.ru/smile/14.gif" class="sm">', bbcode: ":-D"},
					{title: ":-E", img: '<img src="http://waper.ru/smile/18.gif" class="sm">', bbcode: ":-E"},
					{title: ":-I", img: '<img src="http://waper.ru/smile/24.gif" class="sm">', bbcode: ":-I"},
					{title: ":-L", img: '<img src="http://waper.ru/smile/16.gif" class="sm">', bbcode: ":-L"},
					{title: ":-O", img: '<img src="http://waper.ru/smile/12.gif" class="sm">', bbcode: ":-O"},
					{title: ":-P", img: '<img src="http://waper.ru/smile/20.gif" class="sm">', bbcode: ":-P"},
					{title: ":-R", img: '<img src="http://waper.ru/smile/134.gif" class="sm">', bbcode: ":-R"},
					{title: ":-X", img: '<img src="http://waper.ru/smile/135.gif" class="sm">', bbcode: ":-X"},
					{title: ":-Z", img: '<img src="http://waper.ru/smile/27.gif" class="sm">', bbcode: ":-Z"},
					{title: ":!", img: '<img src="http://waper.ru/smile/31.gif" class="sm">', bbcode: ":!"},
					{title: ":?", img: '<img src="http://waper.ru/smile/28.gif" class="sm">', bbcode: ":?"},
					{title: ":(", img: '<img src="http://waper.ru/smile/07.gif" class="sm">', bbcode: ":("},
					{title: ":)", img: '<img src="http://waper.ru/smile/01.gif" class="sm">', bbcode: ":)"},
					{title: ":))", img: '<img src="http://waper.ru/smile/03_2.gif" class="sm">', bbcode: ":))"},
					{title: ":@", img: '<img src="http://waper.ru/smile/29.gif" class="sm">', bbcode: ":@"},
					{title: ":*", img: '<img src="http://waper.ru/smile/09.gif" class="sm">', bbcode: ":*"},
					{title: ":/", img: '<img src="http://waper.ru/smile/30.gif" class="sm">', bbcode: ":/"},
					{title: ":=)", img: '<img src="http://waper.ru/smile/132.gif" class="sm">', bbcode: ":=)"},
					{title: ":D", img: '<img src="http://waper.ru/smile/13.gif" class="sm">', bbcode: ":D"},
					{title: ":E", img: '<img src="http://waper.ru/smile/17.gif" class="sm">', bbcode: ":E"},
					{title: ":F", img: '<img src="http://waper.ru/smile/poisoned.gif" class="sm">', bbcode: ":F"},
					{title: ":I", img: '<img src="http://waper.ru/smile/21.gif" class="sm">', bbcode: ":I"},
					{title: ":L", img: '<img src="http://waper.ru/smile/15.gif" class="sm">', bbcode: ":L"},
					{title: ":O", img: '<img src="http://waper.ru/smile/11.gif" class="sm">', bbcode: ":O"},
					{title: ":P", img: '<img src="http://waper.ru/smile/19.gif" class="sm">', bbcode: ":P"},
					{title: ":Q", img: '<img src="http://waper.ru/smile/22.gif" class="sm">', bbcode: ":Q"},
					{title: ":R", img: '<img src="http://waper.ru/smile/25.gif" class="sm">', bbcode: ":R"},
					{title: ":X", img: '<img src="http://waper.ru/smile/23.gif" class="sm">', bbcode: ":X"},
					{title: ":Z", img: '<img src="http://waper.ru/smile/26.gif" class="sm">', bbcode: ":Z"},
					{title: ":е:", img: '<img src="http://waper.ru/smile/yo.gif" class="sm">', bbcode: ":е:"},
					{title: "%-(", img: '<img src="http://waper.ru/smile/34.gif" class="sm">', bbcode: "%-("},
					{title: "%(", img: '<img src="http://waper.ru/smile/33.gif" class="sm">', bbcode: "%("},
					{title: "%)", img: '<img src="http://waper.ru/smile/32.gif" class="sm">', bbcode: "%)"},
					{title: "%]", img: '<img src="http://waper.ru/smile/35.gif" class="sm">', bbcode: "%]"},
					{title: "%O", img: '<img src="http://waper.ru/smile/36.gif" class="sm">', bbcode: "%O"},
					{title: "=(", img: '<img src="http://waper.ru/smile/sad.gif" class="sm">', bbcode: "=("},
					{title: "=)", img: '<img src="http://waper.ru/smile/smile.gif" class="sm">', bbcode: "=)"},
					{title: "8-)", img: '<img src="http://waper.ru/smile/10_2.gif" class="sm">', bbcode: "8-)"},
					{title: "8(", img: '<img src="http://waper.ru/smile/133.gif" class="sm">', bbcode: "8("},
					{title: "8)", img: '<img src="http://waper.ru/smile/10.gif" class="sm">', bbcode: "8)"},
					{title: ":hack:", img: '<img src="http://waper.ru/smile/hack.gif" class="sm">', bbcode: ":hack:"},
					{title: ":hello:", img: '<img src="http://waper.ru/smile/52.gif" class="sm">', bbcode: ":hello:"}
				]
			});
		}
	})();

});
