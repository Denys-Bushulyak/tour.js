$(window).load(function () {
    $.get('/template.mst').done(function (tpl) {
        tour = new Tour({
            debug: true,
            template: tpl,
            steps: [
                {
                    selector: '#banner',
                    title: "Step 1",
                    content: "This is nav-bar brand."
                },
                {
                    selector: '.icon.featured.fa-cog',
                    content: "This is Cog. Yes and its nice as Cog",
                    tooltip:{
                        size: {
                            width: 200
                        }
                    }
                },
                {
                    selector: '.fa-flash',
                    title: "Step 3",
                    content: "This is Flash"
                },
                {
                    selector: '.fa-star',
                    content: "This is Star"
                },
                {
                    selector: '.actions',
                    content: "Let do it"
                },
                {
                    selector: '.box:nth(1)',
                    content: "Portfolio nth 1."
                },
                {
                    selector: '.box:nth(3)',
                    content: "Portfolio nth 3."
                },
                {
                    selector: '.box:nth(5)',
                    content: "Portfolio nth 5."
                }
            ]
        });

        tour.start();

    }).fail(function () {
        console.error("Tour JS not initialized");
    });

});
