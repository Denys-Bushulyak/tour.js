/**
 *
 * @param options
 * @constructor
 */
function Tour(options) {
    "use strict";

    var that = this;

    if (!options.steps) {
        throw log('error', "Please set 'steps' property to options.");
    }
    if (!options.template) {
        throw log('error', "Please set 'template' property to options.");
    }

    var template = options.template;
    var tooltip = null;
    var padding = options.padding || 10;
    var scrollSpeed = options.scrollSpeed || 500;

    var steps = new Chain(options.steps);
    var ApplicationID = btoa(JSON.stringify(options)).slice(0, options.ID_LENGTH || 10);

    //region Constructor

    Object.defineProperty(this, 'ID', {value: ApplicationID, writable: false});

    Mustache.parse(template);

    tooltip = $(Mustache.render(template));

    tooltip.find('#tour-prev').click(function () {
        that.prev();
    });

    tooltip.find('#tour-next').click(function () {
        that.next();
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
            console[level].call(console, message);
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

        var temp = localStorage.getItem('tour') || '{"shown":[]}';
        temp = JSON.parse(temp);

        if (0 > temp.shown.indexOf(ApplicationID)) {
            temp.shown.push(ApplicationID);
        }
        localStorage.setItem('tour', JSON.stringify(temp));
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
        var popover_position = (selector.popover && selector.popover.position) || "bottom";

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


        correction.top = (correction.top || 0);
        correction.bottom = (correction.bottom || 0);
        correction.right = (correction.right || 0);
        correction.left = (correction.left || 0);

        size.width = (size.width) ? size.width : target.width;
        size.height = (size.height) ? size.height : target.height;

        //region Scrolling
        var control_top = parseInt(correction.scroll || target.top + target.height - correction.top - $(window).height() / 2);

        $('html,body').animate({
            scrollTop: control_top
        }, scrollSpeed, 'swing', function () {
            log('info', "Scrolled to " + control_top);
        });

        //endregion

        //region Border Calculation
        var border_top = target.top - correction.top;
        border_top = border_top >= 0 ? border_top : 0;

        var border_right = document.body.offsetWidth - target.width - target.left - correction.right;
        border_right = border_right >= 0 ? border_right : 0;

        var border_bottom = document.body.scrollHeight - target.top - target.height - correction.bottom;
        border_bottom = border_bottom >= 0 ? border_bottom : 0;

        var border_left = target.left - correction.left;
        border_left = target.left - correction.left >= 0 ? border_left : 0;

        var border = border_top + "px " + border_right + "px " + border_bottom + "px " + border_left + "px";

        style["border-width"] = border;
        //endregion

        //region Popover size calculation
        style.width = size.width + correction.left + correction.right;
        style.height = size.height + correction.top + correction.bottom;
        //endregion

        tooltip.find('#tour-title').text(selector.title || ""); //Refactor #1
        tooltip.find('#tour-content').text(selector.content || ""); //Refactor #1

        tooltip.find('#tour').css(style);

        //Description box (Tooltip) correction

        var tooltip_size = options.tooltip && options.tooltip.size ? options.tooltip.size : null;

        $('#tour-description').removeClass();
        $('#tour-description').removeAttr('style');
        $('#tour-description').addClass(popover_position);
        $('#tour-description').css({
            top: style.height + border_top,
            width: tooltip_size || 'auto',
            left: border_left + style.width/2 - (tooltip_size ? tooltip_size/2 : $('#tour-description').outerWidth()/2)
        });

        /*switch (popover_position) {
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
                log('info', 'Default popover position.');
                break;
        }*/

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
