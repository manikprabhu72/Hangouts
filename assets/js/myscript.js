$(document).ready(function(){
    //Below is the code for getting header height and adjusting alignment for main content. 
        var nav_height = $(".my-navbar").height();
        var footer_height = $(".footer").height();
        $('body').css('padding-top',nav_height);
        $('#content-holder').css('padding-bottom',footer_height);
    }
);

