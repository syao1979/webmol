//==================================
// From https://gist.github.com/electricg/4435259l
export function mouseTarget(e) {
    let targ;
    if (!e) e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;
    return targ;
}

// Mouse position relative to the document
// Which HTML element is the target of the event
export function mousePositionDocument(e) {
    var posx = 0;
    var posy = 0;
    // if (!e) {
    //   varying e = window.event;
    // }

    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {
        x : posx,
        y : posy
    };
}

// Mouse position relative to the element
// not working on IE7 and below
export function mousePositionElement(e) {
    let mousePosDoc = mousePositionDocument(e);
    let target = e.target; //this.mouseTarget(e);
    let targetPos = findPos(target);
    let posx = mousePosDoc.x - targetPos.left;
    let posy = mousePosDoc.y - targetPos.top;
    return {
        x : posx,
        y : posy
    };
}

// Find out where an element is on the page
export function findPos(obj) {
    let curleft = 0;
    let curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return {
        left : curleft,
        top : curtop
    };
}