/**
 * Created by lmz on 16/3/20.
 */

org.dedu.draw.shape.simple = {};

org.dedu.draw.shape.simple.PortsModelInterface = {
    initialize:function(){

    },
    updatePortsAttrs: function (eventName) {

    },
    getPortSelector: function (name) {

    }
};

org.dedu.draw.shape.simple.SuspendPortViewInterface = {
    initialize:function(options){
        if(options.skip_render){
            return;
        }
        org.dedu.draw.ElementView.prototype.initialize.apply(this, arguments);
        //this.listenTo(this, 'add:ports', this.update);
        //this.listenTo(this,'remove:ports',this.update);
        _.bindAll(this,"showSuspendPort","hideSuspendPort");
        this.$el.on('mouseenter',this.showSuspendPort);
        this.$el.on('mouseleave',this.hideSuspendPort);

        _.bindAll(this,"addTipMagnet","removeTipMagnet");

        this.on('cell:highlight',this.addTipMagnet);
        this.on('cell:unhighlight',this.removeTipMagnet);
        this.model.on('change:selected',function(){
            if(this.model.get("selected")){
                this.focus();
            }else{
                this.unfocus();
            }

        },this);
    },
    renderView:function(){
        //org.dedu.draw.ElementView.prototype.render.apply(this, arguments);
        this.renderSuspendPort();
        //this.update();
    },

    renderSuspendPort: function () {

        var suspendTemplate = _.template(this.model.suspendPortMarkup);

        this.up = V(suspendTemplate({dir:'up'})).attr("port",'up');
        this.right = V(suspendTemplate({dir:'right'})).attr("port",'right');
        this.down = V(suspendTemplate({dir:'down'})).attr("port",'down');
        this.left = V(suspendTemplate({dir:'left'})).attr("port",'left');
        this.scale = V(suspendTemplate({dir:'scale'})).attr("port", "scale");
        this.rotatableNode.append(this.up);
        this.rotatableNode.append(this.right);
        this.rotatableNode.append(this.down);
        this.rotatableNode.append(this.left);
        this.rotatableNode.append(this.scale);

        var port_ref_position = this.model.get('port_ref_position');
        if(port_ref_position){
            this.model.attr({
                '.suspend':{ref:'.body',r:3,display:'none'},
                '.portup':{'ref-x':port_ref_position.portup['ref-x'],'ref-y':port_ref_position.portup['ref-y']},
                '.portright':{'ref-x':port_ref_position.portright['ref-x'],'ref-y':port_ref_position.portright['ref-y']},
                '.portdown':{'ref-x':port_ref_position.portdown['ref-x'],'ref-y':port_ref_position.portdown['ref-y']},
                '.portleft':{'ref-x':port_ref_position.portleft['ref-x'],'ref-y':port_ref_position.portleft['ref-y']}
            });
        }else{        
            this.model.attr({
                '.suspend':{ref:'.body',r:3,display:'none'},
                '.portup':{'ref-x':.5,'ref-y':0},
                '.portright':{'ref-x':'100%','ref-y':.5},
                '.portdown':{'ref-x':.5,'ref-y':'100%'},
                '.portleft':{'ref-y':.5,'ref-x':0},
                '.portscale':{magnet: false,'ref-y':'100%','ref-x':'100%',stroke:"#000000",'stroke-width':"1",fill:"#000000"}
            });
        }


        this.trigger('add:ports');
    },

    showSuspendPort: function () {
        this.up.attr('display','block');
        this.right.attr('display','block');
        this.down.attr('display','block');
        this.left.attr('display','block');
        this.scale.attr('display','block');
    },
    hideSuspendPort: function () {
        this.up.attr('display','none');
        this.right.attr('display','none');
        this.down.attr('display','none');
        this.left.attr('display','none');
        this.scale.attr('display','block');
    }
};

org.dedu.draw.shape.simple.Generic = org.dedu.draw.shape.basic.Generic.extend(
    _.extend(
        {},
        org.dedu.draw.shape.basic.PortsModelInterface,
        {
            markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/></g>',
            suspendPortMarkup:'<circle class="suspend port<%= dir %>"/>',
            defaults: org.dedu.draw.util.deepSupplement({
                type: 'simple.Generic',
                size: {width: 1, height: 1},

                attrs: {
                    '.body': {
                        width: 150, height: 250,
                        stroke: '#000000'
                    },
                    '.suspend':{
                        magnet: true
                    },

                }
            }, org.dedu.draw.shape.basic.Generic.prototype.defaults),
            getPortAttrs: function (portName,index,total,selector,type) {
                var attrs = {};

                var portClass = 'port'+index;
                var portSelector = selector + '>.' + portClass;
                var portLabelSelector = portSelector + '>.port-label';
                var portBodySelector = portSelector + '>.port-body';

                attrs[portBodySelector] = {port:{id:portName || _.uniqueId(type),type:type}};
                attrs[portSelector] = {ref:'.body','ref-y':(index + 0.5)*(1/total)};

                if(selector === '.outPorts'){attrs[portSelector]['ref-dx'] = 0;}
                return attrs;
            }
        })
);


org.dedu.draw.shape.simple.GenericView = org.dedu.draw.ElementView.extend(
    _.extend({},org.dedu.draw.shape.simple.SuspendPortViewInterface,{
        addTipMagnet: function (el, opt) {
            var port = V(el);

            if(!$(".tip-"+port.attr('port'),this.$el)[0]){

                var tip = V('circle',{class:"tip tip-"+port.attr('port'),transform:port.attr('transform'),r:15,fill:'black',opacity:0.3});
                this.rotatableNode.append(tip);

            }
            this.showSuspendPort(); // show four ports
        },
        removeTipMagnet: function (el, opt) {
            var port = V(el);
            if($(".tip-"+port.attr('port'),this.$el)[0]){
                $(".tip.tip-"+port.attr('port'),this.$el).remove();
            }
            this.hideSuspendPort(); // hide four ports
        },
        focus: function () {
            this.vel.findOne('.body').addClass('selected');
        },
        unfocus:function(){
            this.vel.findOne('.body').removeClass('selected');
            
        }
    })
);
