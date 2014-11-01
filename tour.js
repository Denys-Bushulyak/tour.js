/**
 *
 * @param options
 * @constructor
 */
function Tour(options) {
    "use strict";

    if (!options.steps) {
        throw log('error', "Please set 'steps' property to options.");
    }
    if (!options.template) {
        throw log('error', "Please set 'template' property to options.");
    }

    var template = options.template;
    var tooltip = null;
    var padding = options.padding || 10;

    var steps = new Chain(options.steps);
    var ApplicationID = btoa(JSON.stringify(options)).slice(0, options.ID_LENGTH || 10);

    //region Constructor

    Object.defineProperty(this, 'ID', {value:ApplicationID, writable:false});

    Mustache.parse(template);

    tooltip = $(Mustache.render(template));

    tooltip.find('#tour-prev').click(function () {
        show(steps.prev());
    });

    tooltip.find('#tour-next').click(function () {
        show(steps.next());
    });

    tooltip.find('#tour-description').click(function (event) {
        event.stopPropagation();
    });

    tooltip.click(function () {
        clear();
    });

    tooltip.appendTo('body');

    //endregion

    //region Methods

    //region EventListeners

    //endregion

    function log(level, message) {
        if (options.debug && options.debug == true) {
            message = "TourJS: " + message;
            console[level](message);
            return message;
        }

        return null;
    }

    function clear() {
        tooltip.remove();
    }

    function setAsShown() {
        if (options.debug !== undefined && options.debug == true) {
            log('info', "Debug MODE.");
            return;
        }

        var tour = localStorage.getItem('tour') || '{"shown":[]}';
        tour = JSON.parse(tour);

        if (0 > tour.shown.indexOf(ApplicationID)) {
            tour.shown.push(ApplicationID);
        }
        localStorage.setItem('tour', JSON.stringify(tour));
    }

    function isShowed() {
        if ((options.debug !== undefined && options.debug == true) || (window.tourDebug !== undefined && window.tourDebug == true)) {
            return false;
        }

        var tour = localStorage.getItem('tour') || '{"shown":[]}';
        tour = JSON.parse(tour);

        return tour.shown.indexOf(ApplicationID) >= 0;
    }

    function show(selector) {
        var target = getElement(document, selector.selector);

        var correction = selector.correction || {};
        var size = selector.size || {};
        var popover = selector.popover || "bottom";

        var style = {"width": null, "height": null, "border-width": null};

        var visible_targets = 0;

        $.each(steps.getItems(), function (key, value) {
            if (getElement(document, value.selector)) {
                visible_targets++;
            }
        });

        if (visible_targets > 1) {

            tooltip.find('#tour-prev, #tour-next').show();

            if (steps.isBegin()) {
                tooltip.find('#tour-prev').hide();
            }

            if (steps.isEnd()) {
                tooltip.find('#tour-next').hide();
            }

        } else {
            tooltip.find('#tour-prev, #tour-next').hide();
        }

        tooltip.find('.tour-close').click(function () {
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

        tooltip.find('#tour-title').text(selector.title || ""); //Refactor #1
        tooltip.find('#tour-content').text(selector.content || ""); //Refactor #1

        tooltip.css(style);

        var control_top = correction.scroll || target.top + target.height - correction.top - $(window).height() / 2;

        //Description box correction
        $('#tour-description').removeClass();
        $('#tour-description').removeAttr('style');

        $('#tour-description').addClass(popover);
        switch (popover) {
            case 'left':
                log('info', "Not implemented");
                break;
            case 'right':
                log('info', "Not implemented");
                break;
            case 'top':
                var _top = -1 * ($('#tour-description').outerHeight(true) + 19) + 'px';
                $('#tour-description').css('top', _top);
                break;
            case 'bottom':
                log('info', 'Default behaviour.');
                break;
        }

        window.scrollTo(0, control_top);
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
                top: top,
                left: left,
                width: width,
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

    //endregion

    //region Prototypes
    Tour.prototype.start = function () {
        log('info', "Started.");

        if (!isShowed()) {

            show(steps.reset());

            setAsShown();
        } else {
            log('info', "Shown.");
        }
    };

    Tour.prototype.prev = function () {
        log('info', "Click 'Back'.");
        show(steps.prev());
    };

    Tour.prototype.next = function () {
        log('info', "Click 'Next'.");
        show(steps.next());
    };

    Tour.prototype.stop = function () {
        clear();
        localStorage.setItem(ApplicationID, 'hidden');
    };
    //endregion
}
