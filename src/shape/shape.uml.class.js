/**
 * Created by lmz on 16/5/5.
 */

org.dedu.draw.shape.uml.Class = org.dedu.draw.shape.basic.Generic.extend({

    markup: [
        '<g class="rotatable">',
        '<g class="scalable">',
        '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/><rect class="uml-class-methods-rect"/>',
        '</g>',
        '<text class="uml-class-name-text"/><text class="uml-class-attrs-text"/><text class="uml-class-methods-text"/>',
        '</g>'
    ].join(''),

    defaults: org.dedu.draw.util.deepSupplement({

        type: 'uml.Class',
        size:{
            width:60,
            height:100
        },
        attrs: {
            rect: { 'width': 200 },

            '.uml-class-name-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#fff9ca' },
            '.uml-class-attrs-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#fff9ca' },
            '.uml-class-methods-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#fff9ca' },

            '.uml-class-name-text': {
                'ref': '.uml-class-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle', 'font-weight': 'bold',
                'fill': 'black', 'font-size': 12,text:'xxx'
            },
            '.uml-class-attrs-text': {
                'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12,
            },
            '.uml-class-methods-text': {
                'ref': '.uml-class-methods-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12,
            }
        },

        name: [],
        attributes: [],
        methods: []

    }, org.dedu.draw.shape.basic.Generic.prototype.defaults),

    initialize: function() {

        this.on('change:name change:attributes change:methods', function() {
            this.updateRectangles();
            this.trigger('uml-update');
        }, this);

        this.updateRectangles();

        org.dedu.draw.shape.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    getClassName: function() {
        return this.get('name');
    },

    updateRectangles: function() {

        var attrs = this.get('attrs');

        var rects = [
            { type: 'name', text: this.getClassName() },
            { type: 'attrs', text: this.get('attributes') },
            { type: 'methods', text: this.get('methods') }
        ];

        var offsetY = 0;
        var line_height = this.get('attrs')['.uml-class-name-text']['font-size'];
        //console.log(line_height);

        _.each(rects, function(rect) {

            var lines = _.isArray(rect.text) ? rect.text : [rect.text];
            var rectHeight = lines.length * line_height + line_height/2;

            attrs['.uml-class-' + rect.type + '-text'].text = lines.join('\n');
            attrs['.uml-class-' + rect.type + '-rect'].height = rectHeight;
            attrs['.uml-class-' + rect.type + '-rect'].transform = 'translate(0,' + offsetY + ')';

            offsetY += rectHeight;
        });
    }

});

org.dedu.draw.shape.uml.ClassView = org.dedu.draw.ElementView.extend({

    initialize: function() {

        org.dedu.draw.ElementView.prototype.initialize.apply(this, arguments);

        this.listenTo(this.model, 'uml-update', function() {
            this.update();
            this.resize();
        });
    }
});

org.dedu.draw.shape.uml.Abstract = org.dedu.draw.shape.uml.Class.extend({

    defaults: org.dedu.draw.util.deepSupplement({
        type: 'uml.Abstract',
        attrs: {
            '.uml-class-name-rect': { fill : '#e74c3c' },
            '.uml-class-attrs-rect': { fill : '#c0392b' },
            '.uml-class-methods-rect': { fill : '#c0392b' }
        }
    }, org.dedu.draw.shape.uml.Class.prototype.defaults),

    getClassName: function() {
        return ['<<Abstract>>', this.get('name')];
    }

});
org.dedu.draw.shape.uml.AbstractView = org.dedu.draw.shape.uml.ClassView;

org.dedu.draw.shape.uml.Interface = org.dedu.draw.shape.uml.Class.extend({

    defaults: org.dedu.draw.util.deepSupplement({
        type: 'uml.Interface',
        attrs: {
            '.uml-class-name-rect': { fill : '#f1c40f' },
            '.uml-class-attrs-rect': { fill : '#f39c12' },
            '.uml-class-methods-rect': { fill : '#f39c12' }
        }
    }, org.dedu.draw.shape.uml.Class.prototype.defaults),

    getClassName: function() {
        return ['<<Interface>>', this.get('name')];
    }

});
org.dedu.draw.shape.uml.InterfaceView = org.dedu.draw.shape.uml.ClassView;

org.dedu.draw.shape.uml.Generalization = org.dedu.draw.Link.extend({
    defaults: {
        type: 'uml.Generalization',
        attrs: { '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: 'white' }}
    }
});

org.dedu.draw.shape.uml.Implementation = org.dedu.draw.Link.extend({
    defaults: {
        type: 'uml.Implementation',
        attrs: {
            '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: 'white' },
            '.connection': { 'stroke-dasharray': '3,3' }
        }
    }
});

org.dedu.draw.shape.uml.Aggregation = org.dedu.draw.Link.extend({
    defaults: {
        type: 'uml.Aggregation',
        attrs: { '.marker-target': { d: 'M 40 10 L 20 20 L 0 10 L 20 0 z', fill: 'white' }}
    }
});

org.dedu.draw.shape.uml.Composition = org.dedu.draw.Link.extend({
    defaults: {
        type: 'uml.Composition',
        attrs: { '.marker-target': { d: 'M 40 10 L 20 20 L 0 10 L 20 0 z', fill: 'black' }}
    }
});

org.dedu.draw.shape.uml.Association = org.dedu.draw.Link.extend({
    defaults: { type: 'uml.Association' }
});