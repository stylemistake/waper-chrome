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
				toolbar: "bold,italic,strike|emoticon|code,image,link|time,date|removeformat|maximize,source",
				style: chrome.extension.getURL("css/sceditor-content.css"),
				locale: "ru",
				width: "100%",
				height: 400,
				dateFormat: "day.month.year",
				autofocus: true,
				emoticonsRoot: "http://waper.ru/smile/",
				emoticons: {
					dropdown: {
						";/": "30.gif",
						":hack:": "hack.gif",
						":rasta:": "74.gif",
						":)": "01.gif",
						":(": "07.gif",
						":lol:": "62.gif",
						":ninja:": "67.gif",
						":overlook:": "overlook.gif",
						":hello:": "52.gif",
						":))": "03_2.gif",
						":*": "09.gif",
						":!": "31.gif",
						":?": "28.gif",
						":Q": "22.gif",
						":D": "13.gif",
						":R": "25.gif",
						"%)": "32.gif",
						"=)": "smile.gif",
						"=(": "sad.gif",
						":O": "11.gif",
						":git:": "git.gif",
						":music:": "music.gif",
						":up:": "90.gif",
						":ok:": "ok.gif",
						":I": "21.gif",
						":E": "17.gif",
						"8(": "133.gif",
						":-))": "03.gif",
						":drink:": "106.gif",
						":pash:": "71.gif"
					},
					more: {
						":police:": "72.gif",
						":vozdp:": "vozdp.gif",
						":Z": "26.gif",
						":clown:": "clown.gif",
						":spider:": "87.gif",
						":down:": "105.gif",
						":-I": "24.gif",
						"%(": "33.gif",
						":lips:": "lips.gif",
						":beg:": "beg.gif",
						":cat:": "98.gif",
						":online:": "online.gif",
						":read:": "75.gif",
						":vst:": "vst.gif",
						":insult:": "insult.gif",
						":closed:": "100.gif",
						":killgun:": "123.gif",
						":punk:": "73.gif",
						":shish:": "80.gif",
						":dont:": "104.gif",
						":babruisk:": "121.gif",
						":beer:": "95.gif",
						":champ:": "99.gif",
						":bye:": "bye.gif",
						":chmok:": "chmok.gif",
						":inlove:": "57.gif",
						":gloomy:": "gloomy.gif",
						":afflict:": "afflicted.gif",
						":str:": "str.gif",
						":lang:": "60.gif",
						":bomb:": "96.gif",
						"%O": "36.gif",
						":heart:": "heart.gif",
						":stars:": "stars.gif",
						":welcome:": "91.gif",
						":@": "29.gif",
						":fuck:": "125.gif",
						"%]": "35.gif",
						":idea:": "56.gif",
						":aaa:": "aaa.gif",
						":inlove2:": "inlove2.gif",
						":X": "23.gif",
						":eat:": "107.gif",
						":angry:": "93.gif",
						"8)": "10.gif",
						":stop:": "88.gif",
						":evil:": "108.gif",
						":-X": "135.gif",
						":gunfire:": "122.gif",
						":hi:": "hi.gif",
						":-L": "16.gif",
						":death:": "102.gif",
						":sun:": "sun.gif",
						":wacko:": "wacko.gif",
						":holyday:": "54.gif",
						":sestra:": "sestra.gif",
						":kiss:": "kiss3.gif",
						":beee:": "beee.gif",
						"%-(": "34.gif",
						":P": "19.gif",
						":-E": "18.gif",
						":-Z": "27.gif",
						":fine:": "110.gif",
						":spam:": "86.gif",
						":help:": "53.gif",
						":wall:": "wall.gif",
						":win:": "win.gif",
						":admin:": "92.gif",
						":kicked:": "124.gif",
						":gunb:": "114.gif",
						":=)": "132.gif",
						";)": "05.gif",
						":sex:": "128.gif",
						":-O": "12.gif",
						":-(": "08.gif",
						":-)": "02.gif",
						":shut_up:": "shut_up.gif",
						"8-)": "10_2.gif",
						":unlock:": "89.gif",
						":yes:": "yes.gif",
						":bravo:": "bravo.gif",
						":deer:": "103.gif",
						":kaka:": "58.gif",
						":blushing:": "blushing.gif",
						":tomygun:": "tomygun.gif",
						":horse:": "horse.gif",
						":gun:": "113.gif",
						":huh:": "55.gif",
						":ban:": "94.gif",
						":clapp:": "clapping.gif",
						":love:": "63.gif",
						":rofl:": "rofl.gif",
						":oops:": "70.gif",
						":chicken:": "chicken.gif",
						":off:": "69.gif",
						":sleep:": "131.gif",
						":е:": "yo.gif",
						":preved:": "preved.gif",
						":lool:": "61.gif",
						":zip:": "zip.gif",
						":real:": "real.gif",
						":prim:": "prim.gif",
						":hangs:": "hangs.gif",
						":teapot:": "119.gif",
						":sad:": "78.gif",
						":pwag:": "pwag.gif",
						":fy:": "fyou.gif",
						":nono:": "127.gif",
						":puh:": "puh.gif",
						":nunu:": "68.gif",
						":bomb2:": "bomb2.gif",
						":dead:": "101.gif",
						":peace:": "118.gif",
						":lapuwka:": "lapuwka.gif",
						":faq:": "115.gif",
						":ubanned:": "ubanned.gif",
						":-P": "20.gif",
						":whisper:": "whisper.gif",
						":proud:": "proud.gif",
						":lame:": "lame.gif",
						":lovs:": "65.gif",
						":what:": "what.gif",
						":lgirl:": "lgirl.gif",
						":tease:": "126.gif",
						":angel:": "angel.gif",
						":fear:": "scare2.gif",
						":glass:": "glasses.gif",
						":icq:": "117.gif",
						":skull:": "82.gif",
						":noman:": "noman.gif",
						":crazy:": "crazy.gif",
						":zombi:": "zombi.gif",
						":football:": "112.gif",
						":kid:": "59.gif",
						":newyear:": "129.gif",
						":-D": "14.gif",
						":pensive:": "pensive.gif",
						":pardon:": "pardon.gif",
						":smoke:": "84.gif",
						":bee:": "bee.gif",
						":F": "poisoned.gif",
						":grin:": "grin.gif",
						":flowers:": "111.gif",
						":-R": "134.gif",
						":uff:": "uff.gif",
						";-)": "06.gif",
						":blush:": "blush.gif",
						":wall2:": "120.gif",
						":shock:": "81.gif",
						":evil2:": "109.gif",
						":vruku:": "vruku.gif",
						":loveu:": "64.gif",
						":sorry:": "sorry.gif",
						":mda:": "66.gif",
						":flood:": "116.gif",
						":salutes:": "79.gif",
						":cry:": "97.gif",
						":cristmas:": "cool3.gif",
						":greenapp:": "greenapp.gif",
						":snezhok:": "snezhok.gif",
						":mamba:": "mamba.gif",
						":rip:": "76.gif",
						":tup:": "tup.gif",
						":smile:": "83.gif",
						":lboy:": "lboy.gif",
						":L": "15.gif",
						":zerkalo:": "zerkalo.gif"
					},
					hidden: {
						":/": "30.gif",
						":полице:": "72.gif",
						":воздп:": "vozdp.gif",
						":З": "26.gif",
						":цловн:": "clown.gif",
						":спидер:": "87.gif",
						":К": "22.gif",
						":-И": "24.gif",
						":липс:": "lips.gif",
						":бег:": "beg.gif",
						":цат:": "98.gif",
						":онлине:": "online.gif",
						":реад:": "75.gif",
						":вст:": "vst.gif",
						":инсулт:": "insult.gif",
						":цлосед:": "100.gif",
						":Р": "25.gif",
						":киллгун:": "123.gif",
						":Д": "13.gif",
						":пунк:": "73.gif",
						":шиш:": "80.gif",
						":донт:": "104.gif",
						":бабруиск:": "121.gif",
						":беер:": "95.gif",
						":чамп:": "99.gif",
						":бэ:": "bye.gif",
						":чмок:": "chmok.gif",
						":инлове:": "57.gif",
						":глоомй:": "gloomy.gif",
						":аффлицт:": "afflicted.gif",
						":стр:": "str.gif",
						":ланг:": "60.gif",
						":бомб:": "96.gif",
						"%О": "36.gif",
						":хеарт:": "heart.gif",
						":старс:": "stars.gif",
						":велцоме:": "91.gif",
						":мусиц:": "music.gif",
						":хак:": "hack.gif",
						":фуцк:": "125.gif",
						":идеа:": "56.gif",
						":ааа:": "aaa.gif",
						":инлове2:": "inlove2.gif",
						":ок:": "ok.gif",
						":еат:": "107.gif",
						":ангрй:": "93.gif",
						":дринк:": "106.gif",
						":довн:": "105.gif",
						":стоп:": "88.gif",
						":евил:": "108.gif",
						":гунфире:": "122.gif",
						":хи:": "hi.gif",
						":О": "11.gif",
						":-Л": "16.gif",
						":деатх:": "102.gif",
						":сун:": "sun.gif",
						":вацко:": "wacko.gif",
						":холйдай:": "54.gif",
						":сестра:": "sestra.gif",
						":кисс:": "kiss3.gif",
						":беее:": "beee.gif",
						":П": "19.gif",
						":-Е": "18.gif",
						":-З": "27.gif",
						":фине:": "110.gif",
						":спам:": "86.gif",
						":хелп:": "53.gif",
						":валл:": "wall.gif",
						":вин:": "win.gif",
						":гит:": "git.gif",
						":админ:": "92.gif",
						":кицкед:": "124.gif",
						":гунб:": "114.gif",
						":паш:": "71.gif",
						":сеx:": "128.gif",
						":-О": "12.gif",
						":шут_уп:": "shut_up.gif",
						":унлоцк:": "89.gif",
						":эс:": "yes.gif",
						":браво:": "bravo.gif",
						":деер:": "103.gif",
						":кака:": "58.gif",
						":блушинг:": "blushing.gif",
						":томйгун:": "tomygun.gif",
						":хорсе:": "horse.gif",
						":гун:": "113.gif",
						":хух:": "55.gif",
						":бан:": "94.gif",
						":цлапп:": "clapping.gif",
						":лове:": "63.gif",
						":И": "21.gif",
						":рофл:": "rofl.gif",
						":оопс:": "70.gif",
						":лол:": "62.gif",
						":чицкен:": "chicken.gif",
						":офф:": "69.gif",
						":слееп:": "131.gif",
						":Е": "17.gif",
						":раста:": "74.gif",
						":превед:": "preved.gif",
						":лоол:": "61.gif",
						":зип:": "zip.gif",
						":реал:": "real.gif",
						":прим:": "prim.gif",
						":хангс:": "hangs.gif",
						":теапот:": "119.gif",
						":сад:": "78.gif",
						":пваг:": "pwag.gif",
						":фй:": "fyou.gif",
						":ноно:": "127.gif",
						":пух:": "puh.gif",
						":нуну:": "68.gif",
						":бомб2:": "bomb2.gif",
						":деад:": "101.gif",
						":пеаце:": "118.gif",
						":лапувка:": "lapuwka.gif",
						":фак:": "115.gif",
						":убаннед:": "ubanned.gif",
						":-П": "20.gif",
						":вхиспер:": "whisper.gif",
						":проуд:": "proud.gif",
						":ламе:": "lame.gif",
						":ловс:": "65.gif",
						":вхат:": "what.gif",
						":лгирл:": "lgirl.gif",
						":теасе:": "126.gif",
						":ангел:": "angel.gif",
						":феар:": "scare2.gif",
						":гласс:": "glasses.gif",
						":ицк:": "117.gif",
						":скулл:": "82.gif",
						":номан:": "noman.gif",
						":уп:": "90.gif",
						":цразй:": "crazy.gif",
						":зомби:": "zombi.gif",
						":фоотбалл:": "112.gif",
						":кид:": "59.gif",
						":невэар:": "129.gif",
						":-Д": "14.gif",
						":пенсиве:": "pensive.gif",
						":пардон:": "pardon.gif",
						":смоке:": "84.gif",
						":бее:": "bee.gif",
						":Ф": "poisoned.gif",
						":грин:": "grin.gif",
						":фловерс:": "111.gif",
						":-Р": "134.gif",
						":уфф:": "uff.gif",
						":блуш:": "blush.gif",
						":валл2:": "120.gif",
						":шоцк:": "81.gif",
						":хелло:": "52.gif",
						":евил2:": "109.gif",
						":вруку:": "vruku.gif",
						":ловеу:": "64.gif",
						":соррй:": "sorry.gif",
						":мда:": "66.gif",
						":флоод:": "116.gif",
						":салутес:": "79.gif",
						":црй:": "97.gif",
						":цристмас:": "cool3.gif",
						":греенапп:": "greenapp.gif",
						":снежок:": "snezhok.gif",
						":мамба:": "mamba.gif",
						":рип:": "76.gif",
						":туп:": "tup.gif",
						":смиле:": "83.gif",
						":лбой:": "lboy.gif",
						":Л": "15.gif",
						":оверлоок:": "overlook.gif",
						":зеркало:": "zerkalo.gif",
						":нинжа:": "67.gif"
					}
				}
			})
		}
	})();

});
