function Tour(options) {
	"use strict";

	var template = Mustache.parse("<div id='tour'>" +
		"<div id='tour-description'>" +
		"<header>" +
		"<h4 id='tour-title'>{{title}}</h4>" +
		"<span id='tour-close' class='tour-close glyphicon glyphicon-remove-sign'></span>" +
		"</header>" +
		"<section id='tour-content'>{{content}}</section>" +
		"<footer>" +
		"<span id='tour-prev' class='glyphicon glyphicon-circle-arrow-left pull-left'></span>" +
		"<button class='n-btn n-red n-small tour-close'>end tour</button>" +
		"<span class='glyphicon glyphicon-circle-arrow-right pull-right' id='tour-next'></span>" +
		"</footer>" +
		"</div>" +
		"</div>");

	var container_id = 'tour';

	var _tooltip = null;
	var _description = null;
	var _current_step = null;
	var padding = 10;

	if (!options || !options.steps) {
		return undefined;
	}

	var _steps = new Chain(options.steps);

	var ID = btoa(JSON.stringify(options));

	function _getID() {
		return ID;
	}

	function getElement(container, selector) {

		function getCoordinates(element) {

			var top = 0, left = 0, width = 0, height = 0;

			width = element.offsetWidth;
			height = element.offsetHeight;

			do {
				top += element.offsetTop || 0;
				left += element.offsetLeft || 0;

				element = element.offsetParent;
			} while (element);


			return {
				top   : top,
				left  : left,
				width : width,
				height: height
			};
		}

		var element = null;

		if ($(container).find(selector).length > 0) {
			element = getCoordinates($(container).find(selector)[0]);
		} else {

			var frames = container.querySelectorAll('iframe');

			if (frames.length > 0) {
				for (var index in frames) {

					try {
						var _e = getElement(frames[index].contentDocument, selector);

						if (_e) {
							element = {};
							element.width = _e.width;
							element.height = _e.height;
							element.top = _e.top + getCoordinates(frames[index]).top;
							element.left = _e.left + getCoordinates(frames[index]).left;
							break;
						}

					} catch (e) {
						continue;
					}
				}
			}
		}

		return element;
	}

	function show(selector) {
		var target = getElement(document, selector.element);

		var correction = selector.correction || {};
		var size = selector.size || {};
		var popover = selector.popover || "bottom";

		var style = {"width": null, "height": null, "border-width": null};

		var visible_targets = 0;

		$.each(_steps.getItems(), function (key, value) {
			if (getElement(document, value.element)) {
				visible_targets++;
			}
		});

		init();

		if (visible_targets > 1) {

			_tooltip.find('#tour-prev, #tour-next').show();

			if (_steps.isBegin()) {
				_tooltip.find('#tour-prev').hide();
			}

			if (_steps.isEnd()) {
				_tooltip.find('#tour-next').hide();
			}

		} else {
			_tooltip.find('#tour-prev, #tour-next').hide();
			_tooltip.find('button.tour-close').hide();
		}

		_tooltip.find('.tour-close').click(function () {
			clear();
		});


		correction.top = (correction.top || padding);
		correction.bottom = (correction.bottom || padding);
		correction.right = (correction.right || padding);
		correction.left = (correction.left || padding);
		size.width = (size.width) ? size.width : target.width;
		size.height = (size.height) ? size.height : target.height;

		var border = (target.top - correction.top) + "px " + (document.body.offsetWidth - target.width - target.left - correction.right) + "px " + (document.body.scrollHeight - target.top - target.height - correction.bottom) + "px " + (target.left - correction.left) + "px";

		style.width = size.width + correction.left + correction.right;
		style.height = size.height + correction.top + correction.bottom;
		style["border-width"] = border;

		_tooltip.find('#tour-title').text(selector.title || ""); //Refactor #1
		_tooltip.find('#tour-content').text(selector.content || ""); //Refactor #1

		_tooltip.css(style);

		var control_top = correction.scroll || target.top + target.height - correction.top - $(window).height() / 2;

		//Description box correction
		$('#tour-description').removeClass();
		$('#tour-description').removeAttr('style');

		$('#tour-description').addClass(popover);
		switch (popover) {
			case 'left':
				console.info("Not implemented");
				break;
			case 'right':
				console.info("Not implemented");
				break;
			case 'top':
				var _top = -1 * ($('#tour-description').outerHeight(true) + 19) + 'px';
				$('#tour-description').css('top', _top);
				break;
			case 'bottom':
				console.info('Default behaviour.');
				break;
		}

		window.scrollTo(0, control_top);
	}

	function clear() {
		$('#' + container_id).remove();
	}

	function setAsShown() {
		if (options.debug !== undefined && options.debug == true) {

			console && console.info("Clear MODE.");
			return;
		}

		var tour = localStorage.getItem('tour') || '{"shown":[]}';
		tour = JSON.parse(tour);

		if (0 > tour.shown.indexOf(_getID())) {
			tour.shown.push(_getID());
		}
		localStorage.setItem('tour', JSON.stringify(tour));
	}

	function isShowed() {
		if ((options.debug !== undefined && options.debug == true) || (window.tourDebug !== undefined && window.tourDebug == true)) {
			return false;
		}

		var tour = localStorage.getItem('tour') || '{"shown":[]}';
		tour = JSON.parse(tour);

		return tour.shown.indexOf(_getID()) >= 0;
	}

	function init() {
		if (!_tooltip) {

			_tooltip = $(Mustache.render(template)); //TODO refactor #1

			_tooltip.find('#tour-prev').click(function () {
				show(_steps.prev());
			});

			_tooltip.find('#tour-next').click(function () {
				show(_steps.next());
			});

			_tooltip.find('#tour-description').click(function (event) {
				event.stopPropagation();
			});

			_tooltip.click(function () {
				clear();
			});

			_tooltip.appendTo('body');
		}
	}

	return {
		stop: function () {
			clear();
			localStorage.setItem(_getID(), 'hidden');
		},

		start: function () {
			if (!isShowed()) {

				show(_steps.reset());

				setAsShown();
			} else {
				console && console.info("Tour already showed.");
			}
		},

		next: function () {
			show(_steps.next());
		},

		prev: function () {
			show(_steps.prev());
		}
	};
}