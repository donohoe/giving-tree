var App = {
	init: function() {
		console.log("Giving Tree - Chrome Extension");
		this.Wishlists = [];
		this.Classlist = [];
		this.updateAffiliateLinks();
		this.updateAmazonSite();
	},

/*	Affiliate Links */

	updateAffiliateLinks: function() {
		var links = document.querySelectorAll('a[href*="amazon.com"],a[href*="/gp/product/"]');
		var len = links.length;
		var re = /\/([A-Z0-9]{10})(\/|\?|\b)/i;
		for (var i=0; i<len; i++) {
			var link = links[i];
			var asin = re.exec(link.href);
			if (asin && asin[1]) {
				link.href = "http://www.amazon.com/gp/product/" + asin[1] + "/?tag=" + School.affiliateCode;
			}
		}
	},

/*	Amazon Site */

	updateAmazonSite: function() {
	//	Not Amazon, skip
		if (location.hostname!="www.amazon.com") {
			return;
		}

	//	General
		this.updateAmazonMenu();

	//	Get list of class WishLists
		this.getClassWishlists();

	//	Show Settings page - first time running or linked
		if (this.isFirstRun() || location.hash=="#/" + School.prefix) {
			this.showSettings();
		}
	},

	updateAmazonMenu: function() {
		var menu = document.getElementById("nav-cross-shop-links") || false;
		var that = this;

		if (menu) {
			menu.innerHTML += "<li class='nav-xs-link'><a href='#/" + School.prefix + "' id='ext-btn-settings' class='nav_a'>Support " + School.name + "</a></li><li id='ext-btn-class-wishlist' class='nav-xs-link' style='display: none;'></li>";

		//	Navigation Bar
			this.updateClassWishlist();

			$("#ext-btn-settings").click(function(){
				that.showSettings();
			});
		}
	},

	insertWishlistMenuItem: function() {
		var nav = document.querySelector("#nav_wishlist_flyout ul.nav_pop_ul li") || false;
		if (nav) {
			var list = this.getSavedWishlistID();
			if (list.wishlistId && list.wishlistId.length) {
				var li = document.getElementById("ext-nav-wishlist") || false;
				if (!li) {
					var item = nav.parentNode;
					li = document.createElement("li");
					li.className = "nav_pop_li ext-nav-item-tweak";
					li.id = "ext-nav-wishlist";
					item.insertBefore(li, nav);
				}

				li.innerHTML = "<a href='/gp/registry/wishlist/" + list.wishlistId + "/?tag=" + School.affiliateCode + "' title='" + list.grade + " " + list.classNo + " with " + list.teacher + "' class='nav_a'>Class Wishlist</a><div class='nav_tag'>" + list.grade + " " + list.classNo + " at " + School.name + "</div>";
			}
		}
	},

/*	Wishlist Selection */

/*	Preferences */

	getSavedWishlistID: function() {
		var list = localStorage.getItem(School.prefix + "Classlist") || [];
		if (list==null || list=="null" || list.length==0) {
			return [];
		}
		return JSON.parse(list);
	},

	setSavedWishlistID: function(list) {
		if (!list) {
			list = "";
		} else {
			list = JSON.stringify(list);
		}
		localStorage.setItem(School.prefix + "Classlist",  list);
	},

/*	Wishlist Document */

	getClassWishlists: function() {
		var that = this;
		this.getSpreadsheet(function(){
		//	Wishlist Menu
			that.insertWishlistMenuItem();
		});
	},

	updateClassWishlist: function() {
		var el = document.getElementById("ext-btn-class-wishlist");
		if (!el) {
			return;
		}

		var list = this.getSavedWishlistID();
		if (list.wishlistId && list.wishlistId.length) {
			el.innerHTML = "<a href='/gp/registry/wishlist/" + list.wishlistId + "/?tag=" + School.affiliateCode + "' title='" + list.grade + " " + list.classNo + " with " + list.teacher + "' class='nav_a'>Class Wishlist</a>";
			el.style.display = "inline";
		} else {
			el.innerHTML = "";
			el.style.display = "none";
		}
	},

/*	Utils */

	getSpreadsheet: function(callback) {
		var expired = this.hasListExpired();
		if (expired) {
			console.log("List expired");
			var url = "https://spreadsheets.google.com/feeds/list/" + School.spreadsheetId + "/od6/public/values?alt=json";
			var that = this;
			this.getJSON(url, function(json){
				if (json.feed && json.feed.entry) {
					that.readSpreadsheet(json.feed.entry);
					if (callback) { callback(); }
				}
			});
		} else {
			console.log("List local");
			this.Wishlists = JSON.parse((localStorage.getItem(School.prefix + "Wishlists") || "{}"));
			if (callback) { callback(); }
		}
	},

	readSpreadsheet: function(items) {
		var list = [];
		var len = items.length;

		for (var i=0;i<len;i++) {
			var item = items[i];
			var grade = (isNaN(parseInt(item.gsx$grade.$t, 10))) ? item.gsx$grade.$t : "Grade " + item.gsx$grade.$t;

			list.push({
				grade:      grade,
				classNo:    item.gsx$classno.$t,
				wishlistId: item.gsx$wishlistid.$t,
				teacher:    item.gsx$teacher.$t,
				notes:      item.gsx$notes.$t
			});
		}

		this.Wishlists = list;

		localStorage.setItem(School.prefix + "LastUpdate", JSON.stringify(new Date().getTime()));
		localStorage.setItem(School.prefix + "Wishlists",  JSON.stringify(list));
	},

	isFirstRun: function() {
		var firstRun = localStorage.getItem(School.prefix + "FirstRun") || false;
		if (firstRun) {
			localStorage.setItem(School.prefix + "FirstRun", "1");
			return true;
		}
		return false;
	},

	hasListExpired: function() {
		var lastUpdated = localStorage.getItem(School.prefix + "LastUpdate") || false;
		var now = new Date().getTime();
		if (lastUpdated) {
			lastUpdated = parseInt(lastUpdated, 10);
			var twoHours = 3600000 * 2;
			if ((lastUpdated + twoHours) > now) {
				return false;
			}
		}
		return true;
	},

	getJSON: function(url, callback) {
		if (!url || !callback) {
			return;
		}

		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function(data) {
		    if (xhr.readyState == 4) {
				if (xhr.responseText) {
					var json = JSON.parse(xhr.responseText);
					callback(json);
				}
			}
		}
		xhr.send();
	},

	getHTML: function(url, callback) {
		if (!url || !callback) {
			return;
		}

		var url = chrome.extension.getURL(url);
		var self = this;
		var xhr = new XMLHttpRequest();

		xhr.open("GET", url, true);
		xhr.onreadystatechange = function(data) {
		    if (xhr.readyState == 4) {
				if (xhr.responseText) {
					callback(xhr.responseText);
				}
			}
		}
		xhr.send();
	},

/*	Overlay */

	showSettings: function() {
		console.log("showSettings");
		var id = "ext-page-settings";
		var settings = document.getElementById(id);
		var that = this;

		if (!settings) {
		//	First-time opening Settings so build it
			settings = document.createElement("div")
			settings.id = id;
			document.body.appendChild(settings);

			this.getHTML("tmpl/settings.html", function(html){
				settings.innerHTML = html;
				settings.style.display = "block";
				var x = setTimeout(function(){
					settings.style.opacity = 1;
				}, 20);
				document.body.style.overflow = "hidden";

				that.updateSettingsPlaceholders();

				$("#ext-settings-overlay, #ext-btn-close").click(function(){
					that.hideSettings();
				});
			});

		} else {
		//	Was previoulsy rendered so skip to this
			settings.style.display = "block";
			var x = setTimeout(function(){
				settings.style.opacity = 1;
			}, 20);
			document.body.style.overflow = "hidden";
		}
	},

	updateSettingsPlaceholders: function() {

		var el = document.querySelector("#ext-wishlist-lists optgroup");
		if (!el) {
			return;
		}

		var list       = this.Wishlists;
		var chosenList = this.getSavedWishlistID();
		var that       = this;

		var html = "";
		var len = this.Wishlists.length;

		for (var i=0; i<len;i++) {
			var label = list[i].grade + " " + list[i].classNo + (list[i].teacher ? (" - " + list[i].teacher) : "");
			var isSelected = (chosenList.wishlistId == list[i].wishlistId) ? " selected" : "";
			html += "<option data-index='" + i + "' value='" + list[i].wishlistId + "'" + isSelected + ">" + label + "</option>";
		}
		el.innerHTML += html;

		var selectBox = document.getElementById("ext-wishlist-lists");
		$(selectBox).change(function () {
			var i = selectBox.selectedIndex -1;
			if (i>-1) {
				that.setSavedWishlistID(that.Wishlists[i]);
			} else {
				that.setSavedWishlistID(false);
			}

			that.insertWishlistMenuItem(); // Insert into Wishlist Menu
			that.updateClassWishlist(); // Update Nav
		});
	},

	hideSettings: function() {
		var settings = document.getElementById("ext-page-settings");
		if (settings) {
			settings.style.opacity = 0;
			location.hash = "";
			var x = setTimeout(function(){
				settings.style.display = "none";
			}, 220);
		}	
		document.body.style.overflow = "auto";
	}
};

$(document).ready(function() {
	App.init();
});
