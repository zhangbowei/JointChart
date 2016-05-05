/**
 * Created by lmz on 16/5/4.
 */
joint.sidebar = (function(){

    var sidebarSeparator = {};

    function drag_sidebar_separator(){
        $("#sidebar-separator").draggable({
            axis: "x",
            start: function (event, ui) {
                var winWidth = $(window).width();
                sidebarSeparator.start = ui.position.left;
                sidebarSeparator.chartWidth = $("#workspace").width();
                sidebarSeparator.chartRight = winWidth-$("#workspace").width()-$("#workspace").offset().left-2;
                sidebarSeparator.width = $("#sidebar").width();
            },
            drag: function(event,ui) {
                var d = ui.position.left-sidebarSeparator.start;
                var newSidebarWidth = sidebarSeparator.width-d;

                var newChartRight = sidebarSeparator.chartRight-d;
                $("#workspace").css("right",newChartRight);
                $("#sidebar").width(newSidebarWidth);

            },
            stop:function(event,ui) {
                $("#sidebar-separator").css("left","auto");
                $("#sidebar-separator").css("right",($("#sidebar").width()+2)+"px");
            }

        });
    }

    function init(){
        drag_sidebar_separator();
    }

    return {
        init:init
    }
})();