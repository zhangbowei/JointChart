org.dedu.draw.shape = {basic:{}};

org.dedu.draw.shape.basic.Generic = org.dedu.draw.Element.extend({
    defaults:org.dedu.draw.util.deepSupplement({
        type:'basic.Generic',
        attrs:{
            '.':{fill:'#fff',stroke:'none',magnet:false},
            text: {
                'pointer-events': 'none',
                'stroke':'none'
            },
        }
    },org.dedu.draw.Element.prototype.defaults)
});

org.dedu.draw.shape.basic.Rect  = org.dedu.draw.shape.basic.Generic.extend({
    markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>',
    defaults: org.dedu.draw.util.deepSupplement({
        type: 'basic.Rect',
        attrs: {
            'rect': {
                fill: '#ffffff',
                stroke: '#000000',
                width: 100,
                height: 60
            },
            'text': {
                fill: '#000000',
                text: '',
                'font-size': 14,
                'ref-x': .5,
                'ref-y': .5,
                'text-anchor': 'middle',
                'y-alignment': 'middle',
                'font-family': 'Arial, helvetica, sans-serif'
            }
        }

    }, org.dedu.draw.shape.basic.Generic.prototype.defaults)
})


org.dedu.draw.shape.basic.PortsModelInterface = {
    initialize:function(){
        this.updatePortsAttrs();
        this.on('change:inPorts change:outPorts',this.updatePortsAttrs,this);

        //Call the 'initialize()' of the partent.
        this.constructor.__super__.constructor.__super__.initialize.apply(this,arguments);
    },
    updatePortsAttrs: function (eventName) {
        // Delete previously set attributes for ports.
        var currAttrs = this.get('attrs');

        // This holds keys to the `attrs` object for all the port specific attribute that
        // we set in this method. This is necessary in order to remove previously set
        // attributes for previous ports.
        this._portSelectors = [];


        var attrs = {};
        _.each(this.get('inPorts'), function (portName, index, ports) {
            var portAttributes = this.getPortAttrs(portName,index,ports.length,'.inPorts','in');
            _.extend(attrs,portAttributes);
        },this);

        _.each(this.get('outPorts'), function(portName, index, ports) {
            var portAttributes = this.getPortAttrs(portName, index, ports.length, '.outPorts', 'out');
           // this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
            _.extend(attrs, portAttributes);
        }, this);

        // Silently set `attrs` on the cell so that noone knows the attrs have changed. This makes sure
        // that, for example, command manager does not register `change:attrs` command but only
        // the important `change:inPorts`/`change:outPorts` command.
        this.attr(attrs, { silent: true });
        // Manually call the `processPorts()` method that is normally called on `change:attrs` (that we just made silent).
        this.processPorts();
        // Let the outside world (mainly the `ModelView`) know that we're done configuring the `attrs` object.
        this.trigger('process:ports');
    },
    getPortSelector: function (name) {

    }
};

org.dedu.draw.shape.basic.PortsViewInterface = {
    initialize: function () {

        // `Model` emits the `process:ports` whenever it's done configuring the `attrs` object for ports.
        this.listenTo(this.model, 'process:ports', this.update);
        org.dedu.draw.ElementView.prototype.initialize.apply(this, arguments);
    },
    update: function () {
        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        org.dedu.draw.ElementView.prototype.update.apply(this, arguments);
    },
    renderPorts: function () {

        var $inPorts = this.$('.inPorts').empty();
        var $outPorts = this.$('.outPorts').empty();

        var portTemplate = _.template(this.model.portMarkup);

        _.each(_.filter(this.model.ports, function(p) { return p.type === 'in'; }), function(port, index) {

            $inPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
        _.each(_.filter(this.model.ports, function(p) { return p.type === 'out'; }), function(port, index) {

            $outPorts.append(V(portTemplate({ id: index, port: port })).node);
        });

    }
};