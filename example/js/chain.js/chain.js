function Chain(items) {

	var _index = 0;

	var _items = items.slice(0) || [];

	function _next() {
		_index++;

		_index = _index > _items.length - 1 ? 0 : _index;

		return _items[_index];
	}

	function _prev() {

		_index--;

		_index = _index < 0 ? _items.length - 1 : _index;

		return _items[_index];
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

		return _items[_items.length - 1];
	}

	function _reset() {
		_index = 0;
		return _current();
	}

	function _isBegin() {
		return _index === 0;
	}

	function _isEnd() {
		return _index == (_items.length - 1);
	}

	function _current() {
		return _items[_index];
	}

	function _beginFrom(index) {
		var newArray = _items.slice(index);

		for (var i = index; i < _items.length; i++) {
			newArray.push(_items[i]);
		}
		return Chain(newArray);
	}

	function _getIndex() {
		return _index;
	}

	function _getItems() {
		return _items;
	}

	function _goTo(index) {
		_index = index;
		return _current();
	}

	function _goToEnd() {
		_index = _items.length - 1;
		return _current();
	}

	return {
		next     : _next,
		prev     : _prev,
		current  : _current,
		first    : _first,
		last     : _last,
		reset    : _reset,
		isEnd    : _isEnd,
		isBegin  : _isBegin,
		goTo     : _goTo,
		goToEnd  : _goToEnd,
		getItems : _getItems,
		beginFrom: _beginFrom,
		getIndex : _getIndex
	};
}