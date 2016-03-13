/**
 * Created by y50-70 on 2/29/2016.
 */

org.dedu.draw.shape.devs = {};

org.dedu.draw.shape.devs.Model = org.dedu.draw.shape.basic.Generic.extend(
    _.extend(
        {},
        org.dedu.draw.shape.basic.PortsModelInterface,
        {
            markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
            portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><text class="port-label"/></g>',

            defaults: org.dedu.draw.util.deepSupplement({

                type: 'devs.Model',
                size: { width: 1, height: 1 },

                inPorts: [],
                outPorts: [],

                attrs: {
                    '.': { magnet: false },
                    '.body': {
                        width: 150, height: 250,
                        stroke: '#000000'
                    },
                    '.port-body': {
                        r: 10,
                        magnet: true,
                        stroke: '#000000'
                    },
                    text: {
                        'pointer-events': 'none',
                    },
                    '.label': { text: 'Model', 'ref-x': .5, 'ref-y': 10, ref: '.body', 'text-anchor': 'middle', fill: '#000000' },
                    '.inPorts .port-label': { x:-15, dy: 4, 'text-anchor': 'end', fill: '#000000' },
                    '.outPorts .port-label':{ x: 15, dy: 4, fill: '#000000' }
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
            },

        }
    )


);

org.dedu.draw.shape.devs.ModelView = org.dedu.draw.ElementView.extend(
    _.extend(
        {},
        org.dedu.draw.shape.basic.PortsViewInterface,
        {
            focus: function () {
                this.vel.findOne('.body').addClass('selected');
            },
            unfocus:function(){
                this.vel.findOne('.body').removeClass('selected');
            }
        })
);