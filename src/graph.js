org.dedu.draw.GraphCells = Backbone.Collection.extend({
    cellNamespace: org.dedu.draw.shape,
    initialize:function(models,opt){
        if(opt.cellNamespace){
            this.cellNamespace = opt.cellNamespace;
        }
    },
    model:function(attrs,options){
        var namespace = options.collection.cellNamespace;

        // Find the model class in the namespace or use the default one.
        var ModelClass = (attrs.type === 'link')
            ? org.dedu.draw.Link
            : org.dedu.draw.util.getByPath(namespace, attrs.type, '.') || org.dedu.draw.Element;

        return new ModelClass(attrs, options);
    }
});


org.dedu.draw.Graph = Backbone.Model.extend({

    initialize:function(attrs,opt){

        opt = opt || {};

        // Passing `cellModel` function in the options object to graph allows for
        // setting models based on attribute objects. This is especially handy
        // when processing JSON graphs that are in a different than JointJS format.
        Backbone.Model.prototype.set.call(this,"cells",new Backbone.Collection());

        //new org.dedu.draw.GraphCells([],{
        //    model:opt.cellModel,
        //    cellNamespace:opt.cellNamespace
        //})

        // Make all the events fired in the `cells` collection available.
        // to the outside world.
        this.get("cells").on("all",this.trigger,this);
        //this.get('cells').on('remove', this._removeCell, this);
    },

    addCell:function(cell,options){
        this.get('cells').add(this._prepareCell(cell), options || {});

        return this;
    },

    _prepareCell:function(cell){
        return cell;
    },

    // Get a cell by `id`.
    getCell: function(id) {

        return this.get('cells').get(id);
    },

});

