describe("Creating tour", function () {

	var options = {
		debug  : true,
		"steps": [
			{
				element: '.button-hello',
				content: "This is nav-bar item by class selection."
			},
			{
				element: 'button:nth-child(2)',
				content: "This is nav-bar item 2"
			},
			{
				element: 'button:nth-child(3)',
				content: "This is nav-bar item 3"
			},
			{
				element: 'button:nth-child(4)',
				content: "This is nav-bar item 4"
			}
		]
	};

	var tour = undefined;

	it("expecting created object", function () {

		tour = Tour();

		expect(tour).toBeUndefined();

		tour = Tour([]);

		expect(tour).toBeUndefined();

		tour = Tour(options);

		tour.start();
	});
});