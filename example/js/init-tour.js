$(window).load(function () {
    $.get('/template.mst').done(function(tpl){
        tour = new Tour({
            debug:true,
            template: tpl,
            steps: [
                {
                selector: '#banner',
                content: "This is nav-bar brand."
                },
                {
                    selector:'.icon.featured.fa-cog',
                    content:"This is Cog"
                }
            ]
        });

        tour.start();

    }).fail(function(){
        console.error("Tour JS not initialized");
    });

});
