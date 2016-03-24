/**
 * Created by lmz on 16/3/20.
 */

org.dedu.draw.shape.uml = {
};

org.dedu.draw.shape.uml.State = org.dedu.draw.shape.devs.Model.extend({
    markup: [
        '<g class="rotatable">',
        '<g class="scalable">',
        '<rect class="uml-state-body"/>',
        '</g>',
        '<path class="uml-state-separator"/>',
        '<text class="uml-state-name"/>',
        '<text class="uml-state-events"/>',
        '</g>'
    ].join(''),

    defaults: org.dedu.draw.util.deepSupplement({

        type: 'uml.State',

        attrs: {
            '.uml-state-body': {
                'width': 200, 'height': 100, 'rx': 10, 'ry': 10,
                'fill': '#fff9ca', 'stroke': '#333', 'stroke-width': 3
            },
            '.uml-state-separator': {
                'stroke': '#333', 'stroke-width': 2
            },
            '.uml-state-name': {
                'ref': '.uml-state-body', 'ref-x': .5, 'ref-y': 5, 'text-anchor': 'middle',
                'fill': '#000000', 'font-family': 'Courier New', 'font-size': 16,
                'font-weight':'bold'
            },
            '.uml-state-events': {
                'ref': '.uml-state-separator', 'ref-x': 5, 'ref-y': 5,
                'fill': '#000000', 'font-family': 'Courier New', 'font-size': 14
            }
        },

        name: 'State',
        events: []

    }, org.dedu.draw.shape.devs.Model.prototype.defaults),

    initialize: function() {

        this.on({
            'change:name': this.updateName,
            'change:events': this.updateEvents,
            'change:size': this.updatePath
        }, this);

        this.updateName();
        this.updateEvents();
        this.updatePath();

        org.dedu.draw.shape.basic.Generic.prototype.initialize.apply(this, arguments);
    },
    updateName: function() {

        this.attr('.uml-state-name/text', this.get('name'));
    },

    updateEvents: function() {

        this.attr('.uml-state-events/text', this.get('events').join('\n'));
    },

    updatePath: function() {

        var middle = this.get('size').height/5*3;

        var d = 'M 0 '+middle+' L ' + this.get('size').width + " "+middle;

        // We are using `silent: true` here because updatePath() is meant to be called
        // on resize and there's no need to to update the element twice (`change:size`
        // triggers also an update).
        this.attr('.uml-state-separator/d', d, { silent: true });
    }

});

org.dedu.draw.shape.uml.StateView = org.dedu.draw.ElementView.extend({
    focus: function () {
        org.dedu.draw.ElementView.prototype.focus.apply(this);
        this.vel.findOne('.uml-state-body').attr({
            fill:"#ffc21d"
        });
    },
    unfocus:function(){
        org.dedu.draw.ElementView.prototype.unfocus.apply(this);
        this.vel.findOne('.uml-state-body').attr({
            fill:"#fff9ca"
        });
    }
});