org.dedu.draw.shape.uml.Region = org.dedu.draw.shape.simple.Generic.extend({
    markup: [
        '<g class="rotatable">',
        '<g class="scalable">',
        '<rect class="uml-region-body"/>',
        '</g>',
        '<path class="uml-region-separator"/>',
        '<text class="uml-region-name"/>',
        '<text class="uml-region-events"/>',
        '</g>'
    ].join(''),

    defaults: org.dedu.draw.util.deepSupplement({

        type: 'uml.Region',
        size: { width: 60, height: 40 },

        attrs: {
            '.uml-region-body': {
                'width': 200, 'height': 100, 
                'rx': 10, 'ry': 10,
                'fill': '#fff9ca', 'stroke': '#333', 'stroke-width': 1
            },
            '.uml-region-name': {
                'ref': '.uml-region-body', 'ref-x': .5, 'ref-y':0, 'text-anchor': 'middle',
                'fill': '#000000', 'font-family': 'Courier New', 'font-size': 12,
                'font-weight':'bold'
            },
            '.uml-region-separator': {
                'stroke': '#333', 'stroke-width': 2
            },
            '.uml-region-events': {
                'ref': '.uml-region-separator', 'ref-x': 5, 'ref-y': 5,
                'fill': '#000000', 'font-family': 'Courier New', 'font-size': 10,
                'display':'block'
            }
        },

        events: [],
        name: 'Region'
    }, org.dedu.draw.shape.simple.Generic.prototype.defaults)

});

org.dedu.draw.shape.uml.RegionView = org.dedu.draw.shape.simple.GenericView.extend({

    initialize: function (options) {
        if(options.skip_render){
            return;
        }
        org.dedu.draw.shape.simple.GenericView.prototype.initialize.apply(this,arguments);
        this.model.on('change:name', this.updateName,this);
        this.model.on('change:events', this.updateEvents,this);
        this.model.on('change:size', this.updatePath,this);
    },

    render:function(){
        org.dedu.draw.shape.simple.GenericView.prototype.render.apply(this,arguments);
        this.originSize = this.model.get('size');
        this.updateName();
        this.updatePath();
        this.updateEvents();
    },

    updateEvents: function () {
        this.vel.findOne('.uml-region-events').text(this.model.get('events').join('\n'));
        var $text = $(".uml-region-events",this.$el);
        var textBbox = V($text[0]).bbox(true, this.$el);
        var size = this.originSize;
        this.model.set('size',{
            width:size.width+textBbox.width,
            height:size.height+textBbox.height
        });
    },

    updateName: function () {
        this.vel.findOne('.uml-region-name').text(this.model.get('name'));
    },

    updatePath: function () {

        var $text = $(".uml-region-name",this.$el);
        var textBbox = V($text[0]).bbox(true, this.$el);

        var d = 'M 0 '+textBbox.height+' L ' + this.model.get('size').width + " "+textBbox.height;

        // We are using `silent: true` here because updatePath() is meant to be called
        // on resize and there's no need to to update the element twice (`change:size`
        // triggers also an update).
        this.vel.findOne('.uml-region-separator').attr('d', d);
    },

    focus: function () {
        this.vel.findOne('.uml-region-body').attr({
            fill:"#ffc21d"
        });
    },

    unfocus:function(){
        this.vel.findOne('.uml-region-body').attr({
            fill:"#fff9ca"
        });
        this.hideSuspendPort();
    }
});