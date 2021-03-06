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

	// Initialize the WysiBB editor
	(function() {
		var urlsRE = /http:\/\/waper.ru\/r\/.+|http:\/\/waper.ru\/office\/talk\/.+|http:\/\/waper.ru\/office\/group\/forum\/write\/.+/
		if (urlsRE.test(window.location.href)) {
			
			// Ctrl+Enter submission
			$(document).keydown( function (e) {
				if ( e.ctrlKey && e.keyCode == 13 ) {
					e.preventDefault();
					e.stopPropagation();
					$("form input[type=submit]").click();
				}
			});

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
					{title: ";-)", img: '<img src="http://waper.ru/smile/06.gif" class="sm">', bbcode: ";-)"},
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
					{title: ":aaa:", img: '<img src="http://waper.ru/smile/aaa.gif" class="sm">', bbcode: ":aaa:"},
					{title: ":admin:", img: '<img src="http://waper.ru/smile/92.gif" class="sm">', bbcode: ":admin:"},
					{title: ":afflict:", img: '<img src="http://waper.ru/smile/afflicted.gif" class="sm">', bbcode: ":afflict:"},
					{title: ":angel:", img: '<img src="http://waper.ru/smile/angel.gif" class="sm">', bbcode: ":angel:"},
					{title: ":angry:", img: '<img src="http://waper.ru/smile/93.gif" class="sm">', bbcode: ":angry:"},
					{title: ":babruisk:", img: '<img src="http://waper.ru/smile/121.gif" class="sm">', bbcode: ":babruisk:"},
					{title: ":ban:", img: '<img src="http://waper.ru/smile/94.gif" class="sm">', bbcode: ":ban:"},
					{title: ":bee:", img: '<img src="http://waper.ru/smile/bee.gif" class="sm">', bbcode: ":bee:"},
					{title: ":beee:", img: '<img src="http://waper.ru/smile/beee.gif" class="sm">', bbcode: ":beee:"},
					{title: ":beer:", img: '<img src="http://waper.ru/smile/95.gif" class="sm">', bbcode: ":beer:"},
					{title: ":beg:", img: '<img src="http://waper.ru/smile/beg.gif" class="sm">', bbcode: ":beg:"},
					{title: ":blush:", img: '<img src="http://waper.ru/smile/blush.gif" class="sm">', bbcode: ":blush:"},
					{title: ":blushing:", img: '<img src="http://waper.ru/smile/blushing.gif" class="sm">', bbcode: ":blushing:"},
					{title: ":bomb:", img: '<img src="http://waper.ru/smile/96.gif" class="sm">', bbcode: ":bomb:"},
					{title: ":bomb2:", img: '<img src="http://waper.ru/smile/bomb2.gif" class="sm">', bbcode: ":bomb2:"},
					{title: ":bravo:", img: '<img src="http://waper.ru/smile/bravo.gif" class="sm">', bbcode: ":bravo:"},
					{title: ":bye:", img: '<img src="http://waper.ru/smile/bye.gif" class="sm">', bbcode: ":bye:"},
					{title: ":cat:", img: '<img src="http://waper.ru/smile/98.gif" class="sm">', bbcode: ":cat:"},
					{title: ":champ:", img: '<img src="http://waper.ru/smile/99.gif" class="sm">', bbcode: ":champ:"},
					{title: ":chicken:", img: '<img src="http://waper.ru/smile/chicken.gif" class="sm">', bbcode: ":chicken:"},
					{title: ":chmok:", img: '<img src="http://waper.ru/smile/chmok.gif" class="sm">', bbcode: ":chmok:"},
					{title: ":clapp:", img: '<img src="http://waper.ru/smile/clapping.gif" class="sm">', bbcode: ":clapp:"},
					{title: ":closed:", img: '<img src="http://waper.ru/smile/100.gif" class="sm">', bbcode: ":closed:"},
					{title: ":clown:", img: '<img src="http://waper.ru/smile/clown.gif" class="sm">', bbcode: ":clown:"},
					{title: ":crazy:", img: '<img src="http://waper.ru/smile/crazy.gif" class="sm">', bbcode: ":crazy:"},
					{title: ":cristmas:", img: '<img src="http://waper.ru/smile/cool3.gif" class="sm">', bbcode: ":cristmas:"},
					{title: ":cry:", img: '<img src="http://waper.ru/smile/97.gif" class="sm">', bbcode: ":cry:"},
					{title: ":dead:", img: '<img src="http://waper.ru/smile/101.gif" class="sm">', bbcode: ":dead:"},
					{title: ":death:", img: '<img src="http://waper.ru/smile/102.gif" class="sm">', bbcode: ":death:"},
					{title: ":deer:", img: '<img src="http://waper.ru/smile/103.gif" class="sm">', bbcode: ":deer:"},
					{title: ":dont:", img: '<img src="http://waper.ru/smile/104.gif" class="sm">', bbcode: ":dont:"},
					{title: ":down:", img: '<img src="http://waper.ru/smile/105.gif" class="sm">', bbcode: ":down:"},
					{title: ":drink:", img: '<img src="http://waper.ru/smile/106.gif" class="sm">', bbcode: ":drink:"},
					{title: ":eat:", img: '<img src="http://waper.ru/smile/107.gif" class="sm">', bbcode: ":eat:"},
					{title: ":evil:", img: '<img src="http://waper.ru/smile/108.gif" class="sm">', bbcode: ":evil:"},
					{title: ":evil2:", img: '<img src="http://waper.ru/smile/109.gif" class="sm">', bbcode: ":evil2:"},
					{title: ":faq:", img: '<img src="http://waper.ru/smile/115.gif" class="sm">', bbcode: ":faq:"},
					{title: ":fear:", img: '<img src="http://waper.ru/smile/scare2.gif" class="sm">', bbcode: ":fear:"},
					{title: ":fine:", img: '<img src="http://waper.ru/smile/110.gif" class="sm">', bbcode: ":fine:"},
					{title: ":flood:", img: '<img src="http://waper.ru/smile/116.gif" class="sm">', bbcode: ":flood:"},
					{title: ":flowers:", img: '<img src="http://waper.ru/smile/111.gif" class="sm">', bbcode: ":flowers:"},
					{title: ":football:", img: '<img src="http://waper.ru/smile/112.gif" class="sm">', bbcode: ":football:"},
					{title: ":fuck:", img: '<img src="http://waper.ru/smile/125.gif" class="sm">', bbcode: ":fuck:"},
					{title: ":fy:", img: '<img src="http://waper.ru/smile/fyou.gif" class="sm">', bbcode: ":fy:"},
					{title: ":git:", img: '<img src="http://waper.ru/smile/git.gif" class="sm">', bbcode: ":git:"},
					{title: ":glass:", img: '<img src="http://waper.ru/smile/glasses.gif" class="sm">', bbcode: ":glass:"},
					{title: ":gloomy:", img: '<img src="http://waper.ru/smile/gloomy.gif" class="sm">', bbcode: ":gloomy:"},
					{title: ":greenapp:", img: '<img src="http://waper.ru/smile/greenapp.gif" class="sm">', bbcode: ":greenapp:"},
					{title: ":grin:", img: '<img src="http://waper.ru/smile/grin.gif" class="sm">', bbcode: ":grin:"},
					{title: ":gun:", img: '<img src="http://waper.ru/smile/113.gif" class="sm">', bbcode: ":gun:"},
					{title: ":gunb:", img: '<img src="http://waper.ru/smile/114.gif" class="sm">', bbcode: ":gunb:"},
					{title: ":gunfire:", img: '<img src="http://waper.ru/smile/122.gif" class="sm">', bbcode: ":gunfire:"},
					{title: ":hack:", img: '<img src="http://waper.ru/smile/hack.gif" class="sm">', bbcode: ":hack:"},
					{title: ":hangs:", img: '<img src="http://waper.ru/smile/hangs.gif" class="sm">', bbcode: ":hangs:"},
					{title: ":heart:", img: '<img src="http://waper.ru/smile/heart.gif" class="sm">', bbcode: ":heart:"},
					{title: ":hello:", img: '<img src="http://waper.ru/smile/52.gif" class="sm">', bbcode: ":hello:"},
					{title: ":help:", img: '<img src="http://waper.ru/smile/53.gif" class="sm">', bbcode: ":help:"},
					{title: ":hi:", img: '<img src="http://waper.ru/smile/hi.gif" class="sm">', bbcode: ":hi:"},
					{title: ":holyday:", img: '<img src="http://waper.ru/smile/54.gif" class="sm">', bbcode: ":holyday:"},
					{title: ":horse:", img: '<img src="http://waper.ru/smile/horse.gif" class="sm">', bbcode: ":horse:"},
					{title: ":huh:", img: '<img src="http://waper.ru/smile/55.gif" class="sm">', bbcode: ":huh:"},
					{title: ":icq:", img: '<img src="http://waper.ru/smile/117.gif" class="sm">', bbcode: ":icq:"},
					{title: ":idea:", img: '<img src="http://waper.ru/smile/56.gif" class="sm">', bbcode: ":idea:"},
					{title: ":inlove:", img: '<img src="http://waper.ru/smile/57.gif" class="sm">', bbcode: ":inlove:"},
					{title: ":inlove2:", img: '<img src="http://waper.ru/smile/inlove2.gif" class="sm">', bbcode: ":inlove2:"},
					{title: ":insult:", img: '<img src="http://waper.ru/smile/insult.gif" class="sm">', bbcode: ":insult:"},
					{title: ":kaka:", img: '<img src="http://waper.ru/smile/58.gif" class="sm">', bbcode: ":kaka:"},
					{title: ":kicked:", img: '<img src="http://waper.ru/smile/124.gif" class="sm">', bbcode: ":kicked:"},
					{title: ":kid:", img: '<img src="http://waper.ru/smile/59.gif" class="sm">', bbcode: ":kid:"},
					{title: ":killgun:", img: '<img src="http://waper.ru/smile/123.gif" class="sm">', bbcode: ":killgun:"},
					{title: ":kiss:", img: '<img src="http://waper.ru/smile/kiss3.gif" class="sm">', bbcode: ":kiss:"},
					{title: ":lame:", img: '<img src="http://waper.ru/smile/lame.gif" class="sm">', bbcode: ":lame:"},
					{title: ":lang:", img: '<img src="http://waper.ru/smile/60.gif" class="sm">', bbcode: ":lang:"},
					{title: ":lapuwka:", img: '<img src="http://waper.ru/smile/lapuwka.gif" class="sm">', bbcode: ":lapuwka:"},
					{title: ":lboy:", img: '<img src="http://waper.ru/smile/lboy.gif" class="sm">', bbcode: ":lboy:"},
					{title: ":lgirl:", img: '<img src="http://waper.ru/smile/lgirl.gif" class="sm">', bbcode: ":lgirl:"},
					{title: ":lips:", img: '<img src="http://waper.ru/smile/lips.gif" class="sm">', bbcode: ":lips:"},
					{title: ":lol:", img: '<img src="http://waper.ru/smile/62.gif" class="sm">', bbcode: ":lol:"},
					{title: ":lool:", img: '<img src="http://waper.ru/smile/61.gif" class="sm">', bbcode: ":lool:"},
					{title: ":love:", img: '<img src="http://waper.ru/smile/63.gif" class="sm">', bbcode: ":love:"},
					{title: ":loveu:", img: '<img src="http://waper.ru/smile/64.gif" class="sm">', bbcode: ":loveu:"},
					{title: ":lovs:", img: '<img src="http://waper.ru/smile/65.gif" class="sm">', bbcode: ":lovs:"},
					{title: ":mamba:", img: '<img src="http://waper.ru/smile/mamba.gif" class="sm">', bbcode: ":mamba:"},
					{title: ":mda:", img: '<img src="http://waper.ru/smile/66.gif" class="sm">', bbcode: ":mda:"},
					{title: ":music:", img: '<img src="http://waper.ru/smile/music.gif" class="sm">', bbcode: ":music:"},
					{title: ":newyear:", img: '<img src="http://waper.ru/smile/129.gif" class="sm">', bbcode: ":newyear:"},
					{title: ":ninja:", img: '<img src="http://waper.ru/smile/67.gif" class="sm">', bbcode: ":ninja:"},
					{title: ":noman:", img: '<img src="http://waper.ru/smile/noman.gif" class="sm">', bbcode: ":noman:"},
					{title: ":nono:", img: '<img src="http://waper.ru/smile/127.gif" class="sm">', bbcode: ":nono:"},
					{title: ":nunu:", img: '<img src="http://waper.ru/smile/68.gif" class="sm">', bbcode: ":nunu:"},
					{title: ":off:", img: '<img src="http://waper.ru/smile/69.gif" class="sm">', bbcode: ":off:"},
					{title: ":ok:", img: '<img src="http://waper.ru/smile/ok.gif" class="sm">', bbcode: ":ok:"},
					{title: ":online:", img: '<img src="http://waper.ru/smile/online.gif" class="sm">', bbcode: ":online:"},
					{title: ":oops:", img: '<img src="http://waper.ru/smile/70.gif" class="sm">', bbcode: ":oops:"},
					{title: ":overlook:", img: '<img src="http://waper.ru/smile/overlook.gif" class="sm">', bbcode: ":overlook:"},
					{title: ":pardon:", img: '<img src="http://waper.ru/smile/pardon.gif" class="sm">', bbcode: ":pardon:"},
					{title: ":pash:", img: '<img src="http://waper.ru/smile/71.gif" class="sm">', bbcode: ":pash:"},
					{title: ":peace:", img: '<img src="http://waper.ru/smile/118.gif" class="sm">', bbcode: ":peace:"},
					{title: ":pensive:", img: '<img src="http://waper.ru/smile/pensive.gif" class="sm">', bbcode: ":pensive:"},
					{title: ":police:", img: '<img src="http://waper.ru/smile/72.gif" class="sm">', bbcode: ":police:"},
					{title: ":preved:", img: '<img src="http://waper.ru/smile/preved.gif" class="sm">', bbcode: ":preved:"},
					{title: ":prim:", img: '<img src="http://waper.ru/smile/prim.gif" class="sm">', bbcode: ":prim:"},
					{title: ":proud:", img: '<img src="http://waper.ru/smile/proud.gif" class="sm">', bbcode: ":proud:"},
					{title: ":puh:", img: '<img src="http://waper.ru/smile/puh.gif" class="sm">', bbcode: ":puh:"},
					{title: ":punk:", img: '<img src="http://waper.ru/smile/73.gif" class="sm">', bbcode: ":punk:"},
					{title: ":pwag:", img: '<img src="http://waper.ru/smile/pwag.gif" class="sm">', bbcode: ":pwag:"},
					{title: ":rasta:", img: '<img src="http://waper.ru/smile/74.gif" class="sm">', bbcode: ":rasta:"},
					{title: ":read:", img: '<img src="http://waper.ru/smile/75.gif" class="sm">', bbcode: ":read:"},
					{title: ":real:", img: '<img src="http://waper.ru/smile/real.gif" class="sm">', bbcode: ":real:"},
					{title: ":rip:", img: '<img src="http://waper.ru/smile/76.gif" class="sm">', bbcode: ":rip:"},
					{title: ":rofl:", img: '<img src="http://waper.ru/smile/rofl.gif" class="sm">', bbcode: ":rofl:"},
					{title: ":sad:", img: '<img src="http://waper.ru/smile/78.gif" class="sm">', bbcode: ":sad:"},
					{title: ":salutes:", img: '<img src="http://waper.ru/smile/79.gif" class="sm">', bbcode: ":salutes:"},
					{title: ":sestra:", img: '<img src="http://waper.ru/smile/sestra.gif" class="sm">', bbcode: ":sestra:"},
					{title: ":sex:", img: '<img src="http://waper.ru/smile/128.gif" class="sm">', bbcode: ":sex:"},
					{title: ":shish:", img: '<img src="http://waper.ru/smile/80.gif" class="sm">', bbcode: ":shish:"},
					{title: ":shock:", img: '<img src="http://waper.ru/smile/81.gif" class="sm">', bbcode: ":shock:"},
					{title: ":shut_up:", img: '<img src="http://waper.ru/smile/shut_up.gif" class="sm">', bbcode: ":shut_up:"},
					{title: ":skull:", img: '<img src="http://waper.ru/smile/82.gif" class="sm">', bbcode: ":skull:"},
					{title: ":sleep:", img: '<img src="http://waper.ru/smile/131.gif" class="sm">', bbcode: ":sleep:"},
					{title: ":/smile:", img: '<img src="http://waper.ru/smile/83.gif" class="sm">', bbcode: ":/smile:"},
					{title: ":smoke:", img: '<img src="http://waper.ru/smile/84.gif" class="sm">', bbcode: ":smoke:"},
					{title: ":snezhok:", img: '<img src="http://waper.ru/smile/snezhok.gif" class="sm">', bbcode: ":snezhok:"},
					{title: ":sorry:", img: '<img src="http://waper.ru/smile/sorry.gif" class="sm">', bbcode: ":sorry:"},
					{title: ":spam:", img: '<img src="http://waper.ru/smile/86.gif" class="sm">', bbcode: ":spam:"},
					{title: ":spider:", img: '<img src="http://waper.ru/smile/87.gif" class="sm">', bbcode: ":spider:"},
					{title: ":stars:", img: '<img src="http://waper.ru/smile/stars.gif" class="sm">', bbcode: ":stars:"},
					{title: ":stop:", img: '<img src="http://waper.ru/smile/88.gif" class="sm">', bbcode: ":stop:"},
					{title: ":str:", img: '<img src="http://waper.ru/smile/str.gif" class="sm">', bbcode: ":str:"},
					{title: ":sun:", img: '<img src="http://waper.ru/smile/sun.gif" class="sm">', bbcode: ":sun:"},
					{title: ":teapot:", img: '<img src="http://waper.ru/smile/119.gif" class="sm">', bbcode: ":teapot:"},
					{title: ":tease:", img: '<img src="http://waper.ru/smile/126.gif" class="sm">', bbcode: ":tease:"},
					{title: ":tomygun:", img: '<img src="http://waper.ru/smile/tomygun.gif" class="sm">', bbcode: ":tomygun:"},
					{title: ":tup:", img: '<img src="http://waper.ru/smile/tup.gif" class="sm">', bbcode: ":tup:"},
					{title: ":ubanned:", img: '<img src="http://waper.ru/smile/ubanned.gif" class="sm">', bbcode: ":ubanned:"},
					{title: ":uff:", img: '<img src="http://waper.ru/smile/uff.gif" class="sm">', bbcode: ":uff:"},
					{title: ":unlock:", img: '<img src="http://waper.ru/smile/89.gif" class="sm">', bbcode: ":unlock:"},
					{title: ":up:", img: '<img src="http://waper.ru/smile/90.gif" class="sm">', bbcode: ":up:"},
					{title: ":vozdp:", img: '<img src="http://waper.ru/smile/vozdp.gif" class="sm">', bbcode: ":vozdp:"},
					{title: ":vruku:", img: '<img src="http://waper.ru/smile/vruku.gif" class="sm">', bbcode: ":vruku:"},
					{title: ":vst:", img: '<img src="http://waper.ru/smile/vst.gif" class="sm">', bbcode: ":vst:"},
					{title: ":wacko:", img: '<img src="http://waper.ru/smile/wacko.gif" class="sm">', bbcode: ":wacko:"},
					{title: ":wall:", img: '<img src="http://waper.ru/smile/wall.gif" class="sm">', bbcode: ":wall:"},
					{title: ":wall2:", img: '<img src="http://waper.ru/smile/120.gif" class="sm">', bbcode: ":wall2:"},
					{title: ":welcome:", img: '<img src="http://waper.ru/smile/91.gif" class="sm">', bbcode: ":welcome:"},
					{title: ":what:", img: '<img src="http://waper.ru/smile/what.gif" class="sm">', bbcode: ":what:"},
					{title: ":whisper:", img: '<img src="http://waper.ru/smile/whisper.gif" class="sm">', bbcode: ":whisper:"},
					{title: ":win:", img: '<img src="http://waper.ru/smile/win.gif" class="sm">', bbcode: ":win:"},
					{title: ":yes:", img: '<img src="http://waper.ru/smile/yes.gif" class="sm">', bbcode: ":yes:"},
					{title: ":zerkalo:", img: '<img src="http://waper.ru/smile/zerkalo.gif" class="sm">', bbcode: ":zerkalo:"},
					{title: ":zip:", img: '<img src="http://waper.ru/smile/zip.gif" class="sm">', bbcode: ":zip:"},
					{title: ":zombi:", img: '<img src="http://waper.ru/smile/zombi.gif" class="sm">', bbcode: ":zombi:"},
					{title: ":basket:", img: '<img src="http://waper.ru/smile/sport/basket.gif" class="sm">', bbcode: ":basket:"},
					{title: ":cska:", img: '<img src="http://waper.ru/smile/sport/cska.gif" class="sm">', bbcode: ":cska:"},
					{title: ":fanat:", img: '<img src="http://waper.ru/smile/sport/fanat.gif" class="sm">', bbcode: ":fanat:"},
					{title: ":fans:", img: '<img src="http://waper.ru/smile/sport/fans.gif" class="sm">', bbcode: ":fans:"},
					{title: ":nhl:", img: '<img src="http://waper.ru/smile/sport/nhl.gif" class="sm">', bbcode: ":nhl:"},
					{title: ":sht:", img: '<img src="http://waper.ru/smile/sport/sht.gif" class="sm">', bbcode: ":sht:"},
					{title: ":spartak:", img: '<img src="http://waper.ru/smile/sport/spartak.gif" class="sm">', bbcode: ":spartak:"},
					{title: ":by:", img: '<img src="http://waper.ru/smile/flag/by.gif" class="sm">', bbcode: ":by:"},
					{title: ":kz:", img: '<img src="http://waper.ru/smile/flag/kz.gif" class="sm">', bbcode: ":kz:"},
					{title: ":rus:", img: '<img src="http://waper.ru/smile/flag/130.gif" class="sm">', bbcode: ":rus:"},
					{title: ":russia:", img: '<img src="http://waper.ru/smile/flag/77.gif" class="sm">', bbcode: ":russia:"},
					{title: ":ua:", img: '<img src="http://waper.ru/smile/flag/127.gif" class="sm">', bbcode: ":ua:"}
				]
			});
		}
	})();

});
