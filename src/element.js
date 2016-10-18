

org.dedu.draw.Element = org.dedu.draw.Cell.extend({

    defaults: {
        position: {
            x: 0,
            y: 0
        },
        size: {
            width: 1,
            height: 1
        },
        angle: 0,
        selected: false
    },

    position: function (x, y, opt) {

    },

    translate: function (tx, ty, opt) {
        tx = tx || 0;
        ty = ty || 0;
        if (tx === 0 && ty === 0) {
            // Like nothing has happened.
            return this;
        }

        opt = opt || {};
        // Pass the initiator of the translation.
        opt.translateBy = opt.translateBy || this.id;
        var position = this.get('position') || { x: 0, y: 0 };

        if (opt.restrictedArea && opt.translateBy === this.id) {

        }

        var translatedPosition = {
            x: position.x + tx,
            y: position.y + ty
        };

        // To find out by how much an element was translated in event 'change:position' handlers.
        opt.tx = tx;
        opt.ty = ty;


        if (!_.isObject(opt.transition)) opt.transition = {};

        this.set('position', translatedPosition, opt);

    },

    resize: function (width, height, opt) {
        this.set('size', { width: width, height: height }, opt);
        return this;
    }

});


org.dedu.draw.ElementView = org.dedu.draw.CellView.extend({

    SPECIAL_ATTRIBUTES: [
        'style',
        'text',
        'html',
        'ref-x',
        'ref-y',
        'ref-dx',
        'ref-dy',
        'ref-width',
        'ref-height',
        'ref',
        'x-alignment',
        'y-alignment',
        'port'
    ],

    className: function () {
        return 'element node ' + this.model.get('type').replace(/\./g, ' ');
    },

    initialize: function (options) {

        if (options.skip_render) {
            return;
        }
        org.dedu.draw.CellView.prototype.initialize.apply(this, arguments);

        _.bindAll(this, 'translate', 'resize', 'rotate');

        this.listenTo(this.model, 'change:position', this.translate);
        this.listenTo(this.model, 'change:size', this.resize);
        this.listenTo(this.model, 'change:angle', this.rotate);


    },

    render: function () {
        this.$el.empty();
        this.renderMarkup();
        this.rotatableNode = this.vel.findOne('.rotatable');
        this.scalableNode = this.vel.findOne('.scalable');

        if (this.renderView) {
            this.renderView();//留给第三方拓展使用
        }
        this.update();
        this.resize();
        this.rotate();
        this.translate();

        return this;
    },

    // `prototype.markup` is rendered by default. Set the `markup` attribute on the model if the
    // default markup is not desirable.
    renderMarkup: function () {
        var markup = this.model.get('markup') || this.model.markup;
        if (markup) {
            var nodes = V(markup);
            this.vel.append(nodes);
        }
    },

    resize: function () {
        var size = this.model.get('size') || {
            width: 1,
            height: 1
        };
        var angle = this.model.get('angle') || 0;

        var scalable = this.scalableNode;
        if (!scalable) {
            // If there is no scalable elements, than there is nothing to resize.
            return;
        }
        var scalableBbox = scalable.bbox(true);
        // Make sure `scalableBbox.width` and `scalableBbox.height` are not zero which can happen if the element does not have any content. By making
        // the width/height 1, we prevent HTML errors of the type `scale(Infinity, Infinity)`.
        scalable.attr('transform', 'scale(' + (size.width / (scalableBbox.width || 1)) + ',' + (size.height / (scalableBbox.height || 1)) + ')');

        this.update();
    },

    // Default is to process the `attrs` object and set attributes on subelements based on the selectors.
    update: function (cell, renderingOnlyAttrs) {

        var allAttrs = this.model.get('attrs');

        var rotatable = this.rotatableNode;
        if (rotatable) {
            var rotation = rotatable.attr('transform');
            rotatable.attr('transform', '');
        }

        var relativelyPositioned = [];
        var nodesBySelector = {};

        _.each(renderingOnlyAttrs || allAttrs, function (attrs, selector) {

            // Elements that should be updated.
            var $selected = this.findBySelector(selector);
            // No element matched by the `selector` was found. We're done then.
            if ($selected.length === 0) return;

            nodesBySelector[selector] = $selected;

            // Special attributes are treated by JointJS, not by SVG.
            var specialAttributes = this.SPECIAL_ATTRIBUTES.slice();

            // If the `filter` attribute is an object, it is in the special JointJS filter format and so
            // it becomes a special attribute and is treated separately.
            if (_.isObject(attrs.filter)) {

                specialAttributes.push('filter');
                this.applyFilter($selected, attrs.filter);
            }

            // If the `fill` or `stroke` attribute is an object, it is in the special JointJS gradient format and so
            // it becomes a special attribute and is treated separately.
            if (_.isObject(attrs.fill)) {

                specialAttributes.push('fill');
                this.applyGradient($selected, 'fill', attrs.fill);
            }
            if (_.isObject(attrs.stroke)) {

                specialAttributes.push('stroke');
                this.applyGradient($selected, 'stroke', attrs.stroke);
            }

            // Make special case for `text` attribute. So that we can set text content of the `<text>` element
            // via the `attrs` object as well.
            // Note that it's important to set text before applying the rest of the final attributes.
            // Vectorizer `text()` method sets on the element its own attributes and it has to be possible
            // to rewrite them, if needed. (i.e display: 'none')
            if (!_.isUndefined(attrs.text)) {

                $selected.each(function () {

                    V(this).text(attrs.text + '', { lineHeight: attrs.lineHeight, textPath: attrs.textPath, annotations: attrs.annotations });
                });
                specialAttributes.push('lineHeight', 'textPath', 'annotations');
            }

            // Set regular attributes on the `$selected` subelement. Note that we cannot use the jQuery attr()
            // method as some of the attributes might be namespaced (e.g. xlink:href) which fails with jQuery attr().
            var finalAttributes = _.omit(attrs, specialAttributes);

            $selected.each(function () {

                V(this).attr(finalAttributes);
            });

            // `port` attribute contains the `id` of the port that the underlying magnet represents.
            if (attrs.port) {

                $selected.attr('port', _.isUndefined(attrs.port.id) ? attrs.port : attrs.port.id);
            }

            // `style` attribute is special in the sense that it sets the CSS style of the subelement.
            if (attrs.style) {

                $selected.css(attrs.style);
            }

            if (!_.isUndefined(attrs.html)) {

                $selected.each(function () {

                    $(this).html(attrs.html + '');
                });
            }

            // Special `ref-x` and `ref-y` attributes make it possible to set both absolute or
            // relative positioning of subelements.
            if (!_.isUndefined(attrs['ref-x']) ||
                !_.isUndefined(attrs['ref-y']) ||
                !_.isUndefined(attrs['ref-dx']) ||
                !_.isUndefined(attrs['ref-dy']) ||
                !_.isUndefined(attrs['x-alignment']) ||
                !_.isUndefined(attrs['y-alignment']) ||
                !_.isUndefined(attrs['ref-width']) ||
                !_.isUndefined(attrs['ref-height'])
            ) {

                _.each($selected, function (el, index, list) {
                    var $el = $(el);
                    // copy original list selector to the element
                    $el.selector = list.selector;
                    relativelyPositioned.push($el);
                });
            }

        }, this);

        // We don't want the sub elements to affect the bounding box of the root element when
        // positioning the sub elements relatively to the bounding box.
        //_.invoke(relativelyPositioned, 'hide');
        //_.invoke(relativelyPositioned, 'show');

        // Note that we're using the bounding box without transformation because we are already inside
        // a transformed coordinate system.
        var size = this.model.get('size');
        var bbox = { x: 0, y: 0, width: size.width, height: size.height };

        renderingOnlyAttrs = renderingOnlyAttrs || {};

        _.each(relativelyPositioned, function ($el) {

            // if there was a special attribute affecting the position amongst renderingOnlyAttributes
            // we have to merge it with rest of the element's attributes as they are necessary
            // to update the position relatively (i.e `ref`)
            var renderingOnlyElAttrs = renderingOnlyAttrs[$el.selector];
            var elAttrs = renderingOnlyElAttrs
                ? _.merge({}, allAttrs[$el.selector], renderingOnlyElAttrs)
                : allAttrs[$el.selector];

            this.positionRelative(V($el[0]), bbox, elAttrs, nodesBySelector);

        }, this);

        if (rotatable) {

            rotatable.attr('transform', rotation || '');
        }
    },

    positionRelative: function (vel, bbox, attributes, nodesBySelector) {

        var ref = attributes['ref'];
        var refDx = parseFloat(attributes['ref-dx']);
        var refDy = parseFloat(attributes['ref-dy']);
        var yAlignment = attributes['y-alignment'];
        var xAlignment = attributes['x-alignment'];

        // 'ref-y', 'ref-x', 'ref-width', 'ref-height' can be defined
        // by value or by percentage e.g 4, 0.5, '200%'.
        var refY = attributes['ref-y'];
        var refYPercentage = _.isString(refY) && refY.slice(-1) === '%';
        refY = parseFloat(refY);
        if (refYPercentage) {
            refY /= 100;
        }

        var refX = attributes['ref-x'];
        var refXPercentage = _.isString(refX) && refX.slice(-1) === '%';
        refX = parseFloat(refX);
        if (refXPercentage) {
            refX /= 100;
        }

        var refWidth = attributes['ref-width'];
        var refWidthPercentage = _.isString(refWidth) && refWidth.slice(-1) === '%';
        refWidth = parseFloat(refWidth);
        if (refWidthPercentage) {
            refWidth /= 100;
        }

        var refHeight = attributes['ref-height'];
        var refHeightPercentage = _.isString(refHeight) && refHeight.slice(-1) === '%';
        refHeight = parseFloat(refHeight);
        if (refHeightPercentage) {
            refHeight /= 100;
        }

        // Check if the node is a descendant of the scalable group.
        var scalable = vel.findParentByClass('scalable', this.el);

        // `ref` is the selector of the reference element. If no `ref` is passed, reference
        // element is the root element.
        if (ref) {

            var vref;

            if (nodesBySelector && nodesBySelector[ref]) {
                // First we check if the same selector has been already used.
                vref = V(nodesBySelector[ref][0]);
            } else {
                // Other wise we find the ref ourselves.
                vref = ref === '.' ? this.vel : this.vel.findOne(ref);
            }

            if (!vref) {
                throw new Error('dia.ElementView: reference does not exists.');
            }

            // Get the bounding box of the reference element relative to the root `<g>` element.
            bbox = vref.bbox(false, this.el);
        }

        // Remove the previous translate() from the transform attribute and translate the element
        // relative to the root bounding box following the `ref-x` and `ref-y` attributes.
        if (vel.attr('transform')) {

            vel.attr('transform', vel.attr('transform').replace(/translate\([^)]*\)/g, '').trim() || '');
        }

        // 'ref-width'/'ref-height' defines the width/height of the subelement relatively to
        // the reference element size
        // val in 0..1         ref-width = 0.75 sets the width to 75% of the ref. el. width
        // val < 0 || val > 1  ref-height = -20 sets the height to the the ref. el. height shorter by 20

        if (isFinite(refWidth)) {

            if (refWidthPercentage || refWidth >= 0 && refWidth <= 1) {

                vel.attr('width', refWidth * bbox.width);

            } else {

                vel.attr('width', Math.max(refWidth + bbox.width, 0));
            }
        }

        if (isFinite(refHeight)) {

            if (refHeightPercentage || refHeight >= 0 && refHeight <= 1) {

                vel.attr('height', refHeight * bbox.height);

            } else {

                vel.attr('height', Math.max(refHeight + bbox.height, 0));
            }
        }

        // The final translation of the subelement.
        var tx = 0;
        var ty = 0;
        var scale;

        // `ref-dx` and `ref-dy` define the offset of the subelement relative to the right and/or bottom
        // coordinate of the reference element.
        if (isFinite(refDx)) {

            if (scalable) {

                // Compensate for the scale grid in case the elemnt is in the scalable group.
                scale = scale || scalable.scale();
                tx = bbox.x + bbox.width + refDx / scale.sx;

            } else {

                tx = bbox.x + bbox.width + refDx;
            }
        }
        if (isFinite(refDy)) {

            if (scalable) {

                // Compensate for the scale grid in case the elemnt is in the scalable group.
                scale = scale || scalable.scale();
                ty = bbox.y + bbox.height + refDy / scale.sy;
            } else {

                ty = bbox.y + bbox.height + refDy;
            }
        }

        // if `refX` is in [0, 1] then `refX` is a fraction of bounding box width
        // if `refX` is < 0 then `refX`'s absolute values is the right coordinate of the bounding box
        // otherwise, `refX` is the left coordinate of the bounding box
        // Analogical rules apply for `refY`.
        if (isFinite(refX)) {

            if (refXPercentage || Math.abs(refX) > 0 && Math.abs(refX) < 1) {

                tx = bbox.x + bbox.width * refX;

            } else if (scalable) {

                // Compensate for the scale grid in case the elemnt is in the scalable group.
                scale = scale || scalable.scale();
                tx = bbox.x + refX / scale.sx;

            } else {

                tx = bbox.x + refX;
            }
        }
        if (isFinite(refY)) {

            if (refYPercentage || Math.abs(refY) > 0 && Math.abs(refY) < 1) {

                ty = bbox.y + bbox.height * refY;

            } else if (scalable) {

                // Compensate for the scale grid in case the elemnt is in the scalable group.
                scale = scale || scalable.scale();
                ty = bbox.y + refY / scale.sy;

            } else {

                ty = bbox.y + refY;
            }
        }

        if (!_.isUndefined(yAlignment) || !_.isUndefined(xAlignment)) {

            var velBBox = vel.bbox(false, this.paper && this.paper.viewport || this.options.paper && this.options.paper.viewport);

            // `y-alignment` when set to `middle` causes centering of the subelement around its new y coordinate.
            if (yAlignment === 'middle') {

                ty -= velBBox.height / 2;

            } else if (isFinite(yAlignment)) {

                ty += (yAlignment > -1 && yAlignment < 1) ? velBBox.height * yAlignment : yAlignment;
            }

            // `x-alignment` when set to `middle` causes centering of the subelement around its new x coordinate.
            if (xAlignment === 'middle') {

                tx -= velBBox.width / 2;

            } else if (isFinite(xAlignment)) {

                tx += (xAlignment > -1 && xAlignment < 1) ? velBBox.width * xAlignment : xAlignment;
            }
        }

        vel.translate(tx, ty);
    },

    rotate: function () {

    },

    translate: function () {
        var position = this.model.get('position') || { x: 0, y: 0 };
        this.vel.attr('transform', 'translate(' + position.x + ',' + position.y + ')');
    },

    findMagnetsInArea: function (rect, opt) {
        rect = g.rect(rect);
        var views = [this.up, this.down, this.left, this.right];

        //    console.log(this.up.bbox(false,this.paper.viewport));

        return _.filter(views, function (view) {
            return view && rect.intersect(g.rect(view.bbox(false, this.paper.viewport)));
        }, this);
    },

    findScalesInArea: function (rect, opt) {
        rect = g.rect(rect);
        var views = [this.scale];

        return _.filter(views, function (view) {
            return view && rect.intersect(g.rect(view.bbox(false, this.paper.viewport)));
        }, this);
    },

    findViewInArea: function (rect, opt) {
        rect = g.rect(rect);
        var view = this.vel;
        return view && rect.containsRect(g.rect(view.bbox(false, this.paper.viewport)));
    },

    pointerdown: function (evt, x, y) {
        var paper = this.paper;
        var r = 3;

        var scalesInArea = this.findScalesInArea({ x: x - r, y: y - r, width: 2 * r, height: 2 * r });

        this._scalesPosition = null;
        _.each(scalesInArea, function (view) {
            this._scalesPosition = view.bbox(false, this.paper.viewport);
        }, this);
        if (this._scalesPosition) {
            this._scalesSize = _.clone(this.model.get('size'));
            return;
        }

        var viewsInArea = this.findMagnetsInArea({ x: x - r, y: y - r, width: 2 * r, height: 2 * r });

        var distance;
        var minDistance = Number.MAX_VALUE;
        var pointer = g.point(x, y);

        _.each(viewsInArea, function (view) {
            if (view.attr('magnet') !== 'false') {
                // find distance from the center of the model to pointer coordinates
                distance = g.rect(view.bbox(false, this.paper.viewport)).center().distance(pointer);

                // the connection is looked up in a circle area by `distance < r`
                if (distance < r && distance < minDistance) {
                    minDistance = distance;
                    this._closestView = view;
                    // this._closestEnd = { id: view.model.id };
                }
            }
        }, this);

        // target is a valid magnet start linking
        if (this._closestView || evt.target.getAttribute('magnet') && paper.options.validateMagnet.call(paper, this, evt.target)) {
            //this.model.trigger('batch:start', { batchName: 'add-link' });

            var link = paper.getDefaultLink(this, evt.target);

            if (this._closestView) {
                link.set({
                    source: {
                        id: this.model.id,
                        redID: this.model.get('redID'),
                        selector: this.getSelector(this._closestView.node),
                        port: evt.target.getAttribute('port')
                    },
                });
            } else {
                link.set({
                    source: {
                        id: this.model.id,
                        redID: this.model.get('redID'),
                        selector: this.getSelector(evt.target),
                        port: evt.target.getAttribute('port')
                    },
                });
            }
            link.set({
                target: { x: x, y: y },
                attrs: {
                    '.marker-target': {
                        d: 'M 10 0 L 0 5 L 10 10 z'
                    }
                }
            });


            paper.model.addCell(link);

            this._linkView = paper.findViewByModel(link);

            this._linkView.pointerdown(evt, x, y);
            this._linkView.startArrowheadMove('target');

        } else {
            this._dx = x;
            this._dy = y;


            this.restrictedArea = paper.getRestrictedArea(this);
            org.dedu.draw.CellView.prototype.pointerdown.apply(this, arguments);
            this.notify('element:pointerdown', evt, x, y);
        }
        this._closestView = null;
    },

    viewMoveInto: function () {
        //search parent element, which contains this.
        var paper = this.paper;
        var parentArray = [];
        _.each(paper._views, function (cell) {
            var view = V(cell.$el[0].firstChild);

            if ((this.id != cell.id) && this.findViewInArea(view.bbox(false, this.paper.viewport))) {
                parentArray.push(cell);
            }
        }, this);


        //judge circle or not, and init deviation
        var absoluteSon = this.vel.bbox(false, this.paper.viewport);
        var rx=0, ry=0;

        if (this.$el.children('.rotatable').children('.scalable').children('circle').length != 0) {
            rx = Math.floor(absoluteSon.width / 2);
            ry = Math.floor(absoluteSon.height / 2);
        } 

        //Depending on situation, set position for this.

        if (parentArray.length != 0) {
            //look for closest cell
            var absoluteParent, min, father;
            _.each(parentArray, function (parent, index) {
                absoluteParent = parent.vel.bbox(false, this.paper.viewport);
                if (index == 0) {
                    min = absoluteSon.x - absoluteParent.x;
                    father = parent;
                } else {
                    if (absoluteSon.x - absoluteParent.x <= min) {
                        father = parent;
                    }
                }
            }, this)
            //set position for this 
            if (this.el.parentElement != parent.el) {
                var absoluteFather = father.vel.bbox(false, this.paper.viewport);
                this.model.set('position', { x: absoluteSon.x - absoluteFather.x + rx, y: absoluteSon.y - absoluteFather.y + ry});
                father.vel.append(this.vel);
            }
        } else {
            if (this.el.parentElement != paper.vis) {
                this.model.set('position', { x: absoluteSon.x + rx, y: absoluteSon.y + ry});
                V(paper.vis).append(this.vel);
            }
        }
    },

    pointermove: function (evt, tx, ty, localPoint) {
        if (this._scalesPosition) {
            var oldSize = this._scalesSize;
            var position = this._scalesPosition;
            var width = oldSize.width + (evt.offsetX - position.x);
            var height = oldSize.height + (evt.offsetY - position.y);
            this.model.resize(width, height);
            return;
        }

        if (this._linkView) {
            // let the linkview deal with this event
            this._linkView.pointermove(evt, localPoint.x, localPoint.y);
        } else {
            var grid = this.paper.options.gridSize;
            var interactive = _.isFunction(this.options.interactive) ? this.options.interactive(this, 'pointermove') : this.options.interactive;
            if (interactive !== false) {
                //var position = this.model.get('position');
                // Make sure the new element's position always snaps to the current grid after
                // translate as the previous one could be calculated with a different grid size.
                //var tx = g.snapToGrid(position.x, grid) - position.x + g.snapToGrid(x - this._dx, grid);
                //var ty = g.snapToGrid(position.y, grid) - position.y + g.snapToGrid(y - this._dy, grid);

                this.model.translate(tx, ty, {
                    restrictedArea: this.restrictedArea,
                    ui: true
                });
            }

            //this._dx = g.snapToGrid(x, grid);
            //this._dy = g.snapToGrid(y, grid);
            org.dedu.draw.CellView.prototype.pointermove.apply(this, arguments);
            this.notify('element:pointermove', evt, tx, ty);

        }
    },

    pointerup: function (evt, x, y) {
        if (this._linkView) {

            var linkView = this._linkView;
            var linkModel = linkView.model;

            // let the linkview deal with this event
            linkView.pointerup(evt, x, y);

            // If the link pinning is not allowed and the link is not connected to an element
            // we remove the link, because the link was never connected to any target element.
            if (!this.paper.options.linkPinning && !_.has(linkModel.get('target'), 'id')) {
                linkModel.remove({ ui: true });
            }
            delete this._linkView;

        } else {
            this.notify('element:pointerup', evt, x, y);
            org.dedu.draw.CellView.prototype.pointerup.apply(this, arguments);
            this.viewMoveInto();
        }
    }

});
