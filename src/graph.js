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
        var cells = new org.dedu.draw.GraphCells([], {
            model: opt.cellModel,
            cellNamespace: opt.cellNamespace,
            graph: this
        });
        Backbone.Model.prototype.set.call(this, 'cells', cells);

        // Make all the events fired in the `cells` collection available.
        // to the outside world.
        this.get("cells").on("all",this.trigger,this);
        //this.get('cells').on('remove', this._removeCell, this);


        // Outgoing edges per node. Note that we use a hash-table for the list
        // of outgoing edges for a faster lookup.
        // [node ID] -> Object [edge] -> true
        this._out = {};
        // Ingoing edges per node.
        // [node ID] -> Object [edge] -> true
        this._in = {};
        // `_nodes` is useful for quick lookup of all the elements in the graph, without
        // having to go through the whole cells array.
        // [node ID] -> true
        this._nodes = {};
        // `_edges` is useful for quick lookup of all the links in the graph, without
        // having to go through the whole cells array.
        // [edge ID] -> true
        this._edges = {};

        this.selectionSet = [];//user select much elements

        cells.on('add', this._restructureOnAdd, this);
        cells.on('remove', this._restructureOnRemove, this);
        cells.on('all', function(name) {console.log(name);}, this);
        cells.on('remove', function(name) {console.log(name);}, this);
        cells.on('add', function(name) {console.log(name);}, this);
    },


    _restructureOnAdd: function(cell) {

        if (cell.isLink()) {
            this._edges[cell.id] = true;
            var source = cell.get('source');
            var target = cell.get('target');
            if (source.id) {
                (this._out[source.id] || (this._out[source.id] = {}))[cell.id] = true;
            }
            if (target.id) {
                (this._in[target.id] || (this._in[target.id] = {}))[cell.id] = true;
            }
        } else {
            this._nodes[cell.id] = true;
        }
    },

    _restructureOnRemove: function(cell) {
        if (cell.isLink()) {
            delete this._edges[cell.id];
            var source = cell.get('source');
            var target = cell.get('target');
            if (source.id && this._out[source.id] && this._out[source.id][cell.id]) {
                delete this._out[source.id][cell.id];
            }
            if (target.id && this._in[target.id] && this._in[target.id][cell.id]) {
                delete this._in[target.id][cell.id];
            }
        } else {
            delete this._nodes[cell.id];
        }
    },


    isExist:function(id){
        var models = this.get('cells').models;
        for(var i=0;i<models.length;i++){
            if(models[i].get('redID')==id){
                return true;
            }
        }
        return false;
    },

    getCellByRedID:function(id) {
        var models = this.get('cells').models;
        for(var i in models){
            if(models[i].get('redID') == id){
                return models[i];
            }
        }

    },

    selectAll:function(){

        this.get('cells').models.forEach(function(model){
            model.focus();
        });
        this.selectionSet = this.get('cells').models;
    },

    updateSelection: function (selection_models_new) {
        var selection_models = _.difference(this.selectionSet,selection_models_new);
        selection_models.forEach(function(model){
            model.focus();
        });
        this.selectionSet = selection_models_new;
    },

    cancelSelection: function (model_array) {
        var selection_models = _.difference(this.selectionSet,model_array);
        selection_models.forEach(function(model){
            model.unfocus();
        });
        this.selectionSet = [];
    },

    focus:function(model){
        if(this.selectionSet.indexOf(model)==-1){
            this.cancelSelection([model]);
            model.focus();
            this.selectionSet.push(model);
        }
    },


    addCell:function(cell,options){
        this.get('cells').add(this._prepareCell(cell), options || {});
        var args ;
        var self = this;
        if(cell instanceof org.dedu.draw.Link){
            cell.on('link:complete',function(){
 
                args = {
                    source: this.get('source'),
                    target: this.get('target'),
                    redID: this.get('redID'),
                    type: 'link'
                };
                self.notify.apply(this,['node-red:node-link-added'].concat(args));
            },cell);
        }else if(cell instanceof org.dedu.draw.Element){
            args = {
                redID: cell.get('redID'),
                type:'node'
            };
            this.notify.apply(this,['node-red:node-link-added'].concat(args));
        }
        
        return this;
    },

    _prepareCell:function(cell){
        return cell;
    },


    clear: function(opt) {

        opt = _.extend({}, opt, { clear: true });

        var cells = this.get('cells').models;

        if (cells.length === 0) return this;

        this.trigger('batch:start', { batchName: 'clear' });

        // The elements come after the links.
        _.sortBy(cells,function(cell) {
            return cell.isLink() ? 1 : 2;
        });

        do {

            // Remove all the cells one by one.
            // Note that all the links are removed first, so it's
            // safe to remove the elements without removing the connected
            // links first.
            cells.shift().remove(opt);

        } while (cells.length > 0);

        this.trigger('batch:stop', { batchName: 'clear' });

        return this;
    },

    removeSection: function () {
        this.get('cells').remove(this.selectionSet);
        var selectionIDs = {};
        for(var i=0;i<this.selectionSet.length;i++){
            selectionIDs[this.selectionSet[i].get('redID')] = this.selectionSet[i] instanceof org.dedu.draw.Link?'link':'node';
        }
        this.notify.apply(this,['node-red:node-link-removed'].concat(selectionIDs));
        this.selectionSet = [];
    },

    notify:function(evt){
        var args = Array.prototype.slice.call(arguments, 1);
        this.trigger.apply(this, [evt].concat(args));
    },

    // Get a cell by `id`.
    getCell: function(id) {
        return this.get('cells').get(id);
    },

    getElements: function() {
        return _.map(this._nodes, function(exists, node) { return this.getCell(node); }, this);
    },

});

