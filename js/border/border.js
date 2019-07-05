class BorderLayout {
    constructor(root, onStateChanged){
        this.onStateChanged = onStateChanged;
        this.dragging = null;
        this.area = {
            north: {element: root.querySelector('.north')},
            south: {element: root.querySelector('.south')},
            west: {element: root.querySelector('.west')},
            east: {element: root.querySelector('.east')},
            center: {element: root.querySelector('.center')}
        };
        this.setInitSize('north', root.offsetHeight);
        this.setInitSize('south', root.offsetHeight);
        this.setInitSize('west', root.offsetWidth);
        this.setInitSize('east', root.offsetWidth);

        this.redraw();
        // this.addDrag('north', 'bottom', {left: '0', bottom: '0', width: '100%', cursor: 'ns-resize'}, function (e) {
        //     return this.origSize + e.clientY - this.origY;
        // });

        this.addDrag('south', 'top', {left: '0', top: '0', width: '100%', cursor: 'ns-resize'}, function (e) {
            return this.origSize - e.clientY + this.origY;
        });

        this.addDrag('west', 'right', {right: '0', top: '0', height: '100%', cursor: 'ew-resize'}, function (e) {
            return this.origSize + e.clientX - this.origX;
        });

        this.addDrag('east', 'left', {left: '0', top: '0', height: '100%', cursor: 'ew-resize'}, function (e) {
            return this.origSize - e.clientX + this.origX;
        });

        root.addEventListener('mousemove', (e) => {
            if (this.dragging) {
                let target = this.area[this.dragging.target];
                target.size = Math.min(target.maxSize, Math.max(target.minSize, this.dragging.size(e)));
                this.redraw();
            }
        });
        root.addEventListener('mouseup', (e) => {
            this.dragEnded(this.onStateChanged);
        });
        root.addEventListener('mouseout', (e) => {
            if (e.target === root) {
                this.dragEnded(this.onStateChanged);
            }
        });

        // initialize
        this.dragEnded(onStateChanged);
    }

    resize(size) {
        for (let prop in size) {
            this.area[prop].size = size[prop];
        }
        this.redraw();
    }

    maximize(name) {
        this.setSize(name, this.area[name].maxSize);
    }

    minimize(name) {
        this.setSize(name, this.area[name].minSize);
    }

    hide(name) {
        this.setSize(name, 0);
    }

    setSize(name, size) {
        this.area[name].size = size;
        this.redraw();
    }

    setInitSize(name, parent) {
        let elem = this.area[name].element;
        if (elem) {
            this.area[name].size = this.unitToPx(elem.getAttribute('size') || '20%', parent);
            this.area[name].minSize = this.unitToPx(elem.getAttribute('min-size') || '1px', parent);
            this.area[name].maxSize = this.unitToPx(elem.getAttribute('max-size') || '40%', parent);
        }
    }

    unitToPx(value, parent) {
        if (this.endsWith(value, 'px')) {
            return parseInt(value);
        }
        if (this.endsWith(value, '%')) {
            return parseInt(value) / 100 * parent;
        }
    }

    endsWith(s, end) {
        return s.substring(s.length - end.length) === end;
    }

    redraw() {
        this.setSizeAttr('north', {height: 'north'});
        this.setSizeAttr('south', {height: 'south'});
        this.setSizeAttr('west', {width: 'west', paddingTop: 'north', paddingBottom: 'south'});
        this.setSizeAttr('east', {width: 'east', paddingTop: 'north', paddingBottom: 'south'});
        this.setSizeAttr('center', {paddingTop: 'north', paddingLeft: 'west', paddingBottom: 'south', paddingRight: 'east'});
    }

    setSizeAttr(target, value) {
        let elem = this.area[target].element;
        if (elem) {
            for (let prop in value) {
                elem.style[prop] = this.area[value[prop]].size + 'px';
            }
        }
    }

    getSize(target, attr) {
        let elem = this.area[target].element;
        return elem && parseInt(elem[attr]);
    }

    addDrag(name, dragSide, style, sizeFn) {
        let target = this.area[name].element;
        if (target && target.classList.contains('resizable')) {
            let drag = document.createElement('div');
            drag.className = 'drag';
            Object.assign(drag.style, style);
            target.appendChild(drag);
            let borderWidth = parseInt(getComputedStyle(drag)['border-top-width']);
            let skey = `border${this.capital(dragSide)}`;
            // console.log(skey)
            // console.log(`${2 * borderWidth}px solid transparent`);
            
            target.querySelector('.content').style[skey] = 2 * borderWidth + 'px solid transparent';
            // target.querySelector('.content').style['border' + this.capital(dragSide)] = 2 * borderWidth + 'px solid gray';
            drag.addEventListener('mousedown', (e) => {
                this.dragging = {
                    target: name,
                    origX: e.clientX,
                    origY: e.clientY,
                    origSize: this.area[name].size
                };
                this.dragging.size = sizeFn.bind(this.dragging);
            });
        }
    }

    capital(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    dragEnded(listener) {
        if (this.dragging) {
            if (listener) {
                listener({
                    north: this.getSize('north', 'offsetHeight'),
                    south: this.getSize('south', 'offsetHeight'),
                    west: this.getSize('west', 'offsetWidth'),
                    east: this.getSize('east', 'offsetWidth'),
                    centerw: this.getSize('center', 'offsetWidth'),
                    centerh: this.getSize('center', 'offsetHeight')
                });
            }
            this.dragging = null;
        }
    }
};

export default BorderLayout;
