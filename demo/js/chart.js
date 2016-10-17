/**
 * Created by lmz on 16/5/4.
 */

joint.chart = (function () {


    var basicElements = {
        'basic': {
            'basic.Rect': {

            },
            'basic.CRect': {

            },
            'basic.Circle': {

            },
            'basic.Ellipse': {

            }
        },
        'uml_class': {
            'uml.Class': {
                name: 'class',
                attributes: 'sdf'
            },
            'uml.Abstract': {
                attrs: {
                    '.uml-class-name-text': {
                        'ref-y': 0.5,
                        'font-size': 8,
                        'fill': '#f3f3f3',
                    }
                }
            },
            'uml.Interface': {

            }
        },
        'uml_state': {
            'uml.StartState': {

            },
            'uml.EndState': {

            },
            'uml.State': {

            }
        },
        'uml_region': {
            'uml.Region': {

            }
        }
    };

    function getConfigByType(category, node_type) {
        return basicElements[category][node_type];
    }

    var graph = new org.dedu.draw.Graph;
    var chart = new org.dedu.draw.Chart({
        el: $('#chart'),
        width: 5000,
        height: 5000,
        tabindex: 1,
        gridSize: 1,
        model: graph,
        style: {

        }
    });
    function chart_drop() {
        $('#chart').droppable({
            accept: '.geItem',
            drop: function (event, ui) {
                var node_type = ui.draggable[0].type;
                var category = ui.draggable[0].category;
                d3.event = event;
                var mousePos = d3.touches(this)[0] || d3.mouse(this);

                var namespaceClass = org.dedu.draw.util.getByPath(chart.options.cellViewNamespace, node_type, ".");
                var cell = new namespaceClass(_.merge(getConfigByType(category, node_type), {
                    position: {
                        x: mousePos[0],
                        y: mousePos[1]
                    }
                }));
                graph.addCell(cell);
            }
        });
    }

    function init() {
        chart_drop();
    }

    return {
        init: init,
        chart: chart,
        graph: graph
    }
})();

