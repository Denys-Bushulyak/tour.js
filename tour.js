function Chain(items) {

    var index = 0;

    var _items = items || [];

    if (localStorage) {
        if (window.DEBUG && window.DEBUG == true) {
            localStorage.removeItem('tour');
            console && console.info("Tour in DEBUG mode.");
        }
    }

    function _next() {
        index++;

        index = index > _items.length - 1 ? 0 : index;

        return  _items[index];
    }

    function _prev() {

        index--;

        index = index < 0 ? _items.length - 1 : index;

        return  _items[index];
    }

    function _push(item) {
        _items.push(item);
    }

    function _first(item) {

        if (item) {
            _items[0] = item;
        }

        return _items[0] || undefined;
    }

    function _last(item) {
        if (item) {
            _items[_items.length - 1] = item;
        }

        return _items[_items.length - 1] || undefined;
    }

    function _reset() {
        index = 0;
        return  _current();
    }

    function _isFirst() {
        return index == 0;
    }

    function _isEnd() {
        return index == (_items.length - 1);
    }

    function _current() {
        return _items[index] || undefined;
    }

    function _beginFrom(index) {
        return new Chain(_.union(_items.slice(index), _items.slice(0, index)));
    }

    return {
        next     : _next,
        prev     : _prev,
        current  : _current,
        push     : _push,
        first    : _first,
        last     : _last,
        reset    : _reset,
        isEnd    : _isEnd,
        isFirst  : _isFirst,
        items    : _items,
        beginFrom: _beginFrom,
        getIndex : function () { return index; }
    };
}

function Tour(options) {
    "use strict";

    var container_id = 'tour';

    var _focus = null;
    var _description = null;
    var _current_step = null;
    var padding = 10;

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
        var popover = selector.popover || "bottom";

        var style = {"width": null, "height": null, "border-width": null};

        var visible_targets = 0;

        $.each(_steps.items, function (key, value) {
            if (getElement(document, value.element)) {
                visible_targets++;
            }
        });

        init();
        
        if (visible_targets > 1) {

            _focus.find('#tour-prev, #tour-next').show();

            if (_steps.isFirst()) {
                _focus.find('#tour-prev').hide();
            }

            if (_steps.isEnd()) {
                _focus.find('#tour-next').hide();
            }

        } else {
            _focus.find('#tour-prev, #tour-next').hide();
            _focus.find('button.tour-close').hide();
        }

        _focus.find('.tour-close').click(function () {
            clear();
        });


        correction.top = (correction.top || padding);
        correction.bottom = (correction.bottom || padding);
        correction.right = (correction.right || padding);
        correction.left = (correction.left || padding);

        var border = (target.top - correction.top) + "px " + (document.body.offsetWidth - target.width - target.left - correction.right) + "px " + (document.body.scrollHeight - target.top - target.height - correction.bottom) + "px " + (target.left - correction.left) + "px";

        style.width = target.width + correction.left + correction.right;
        style.height = target.height + correction.top + correction.bottom;
        style["border-width"] = border;

        _focus.find('#tour-title').text(selector.title || "");
        _focus.find('#tour-content').text(selector.content || "");

        _focus.css(style);

        var control_top = correction.scroll || target.top +target.height - correction.top - $(window).height()/2;

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

    function init(){
        if (!_focus) {

            _focus = $("<div id='" + container_id + "'><div id='tour-description'><header><h4 id='tour-title'></h4><span id='tour-close' class='tour-close glyphicon glyphicon-remove-sign'></span></header><section id='tour-content'></section><footer><span id='tour-prev' class='glyphicon glyphicon-circle-arrow-left pull-left'></span><button class='n-btn n-red n-small tour-close'>end tour</button><span class='glyphicon glyphicon-circle-arrow-right pull-right' id='tour-next'></span></footer></div></div>");

            _focus.find('#tour-prev').click(function () {
                show(_steps.prev());
            });

            _focus.find('#tour-next').click(function () {
                show(_steps.next());
            });

            _focus.appendTo('body');
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