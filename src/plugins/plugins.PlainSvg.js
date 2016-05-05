/**
 * Created by lmz on 16/5/3.
 */




var namespace = org.dedu.draw.shape;

var defaultViewClass = org.dedu.draw.ElementView;

var tmp_chart = new org.dedu.draw.Chart({
    el: $('#tmp_chart'),
    width: 36,
    height: 36,
    tabindex:1,
    gridSize: 1,
    style: {

    }
});

function renderView(node_type,options){
    var view = createViewForModel(node_type,options);
    V(tmp_chart.vis).append(view.el);
    view.paper = tmp_chart;
    view.render();

    return view;
}

function createViewForModel(node_type,options) {
    var view_type = node_type + "View";

    var namespaceViewClass = org.dedu.draw.util.getByPath(namespace, view_type, ".");
    var namespaceClass = org.dedu.draw.util.getByPath(namespace, node_type, ".");

    var ViewClass = namespaceViewClass || defaultViewClass;

    var cell = new namespaceClass(options);

    var view = new ViewClass({
        model: cell,
        skip_render: true,
        paper: tmp_chart
    });
    return view;
}
function getPaleteeSvg(category,node_type,options){
    var $tmp_a = $('<a href="javascript:void(0);" class="geItem" style="overflow: hidden; width: 40px; height: 40px; padding: 1px;">');
    var $tmp_svg = $('<svg style="width: 36px; height: 36px; display: block; position: relative; overflow: hidden; cursor: move; "></svg>');
    $tmp_a.append($tmp_svg);
    var view = renderView(node_type,options);

    $tmp_svg.append($(view.el));
    $tmp_a[0].type = node_type;
    $tmp_a[0].category = category;

    //free memory
    delete view.model;
    delete view;

    return $tmp_a;
    //console.log($tmp_a);
}