function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function buildDom(object, targetObject) {
    /* Builds a DOM element out of an object of the format
     * {E: 'tag',
     *   attr: 'attribute value',
     *   C: [
     *     {E: 'childtag', attr: 'child attribute'},
     *     {E: 'childtag', C: 'C: element is the same as C: [element]}'
     *     'strings are shorthand for document.createTextNode',
     *     document.createElement('span'),
     *     'the above works as well'
     *   ]
     * }
     *
     * If some object is given the key K, the result is another object that has a key
     * for each value of K in the input object. Behind the key is a reference to the
     * new DOM element. For example:
     * {K: 'tagElement', E: 'tag',
     *   C: [
     *     {K: 'spanElement', E: 'span'}
     *   ]
     * }
     * --> {tagElement: <DOM element <tag>>, spanElement: <DOM element <span>>}
     *
     * If the targetObject argument is given, the elements are added to it instead,
     * and the parent element is returned. Useful with `this`.
     */

    if (typeof object === 'string') {
        return document.createTextNode(object);
    } else if (object instanceof HTMLElement || object instanceof Text) {
        return object;
    }

    let element = document.createElement(object.E); // E for element
    let elementObject = {}; // has 0 or more elements behind keys

    if (object.K) { // K for key
        elementObject[object.K] = element;
    }

    // add props to the DOM element
    for (let key in object) {
        if (['K', 'E', 'C'].includes(key)) { // skip buildDom specific syntax
            continue;
        } else if (/^on[a-z]+$/i.test(key)) { // onclick and such
            // onclick --> click
            let listener = key.match(/on(.+)/i)[1];
            // support both `onclick: _ => 'foo'` and `onclick: [_ => 'foo', _ => 'bar']`
            let functions = object[key] instanceof Array ? object[key] : [object[key]];
            for (let fun of functions) {
                element.addEventListener(listener, fun);
            }
        } else if (Object.getPrototypeOf(object[key]) === Object.prototype) { // required by style
            for (let subkey in object[key]) {
                element[key][subkey] = object[key][subkey];
            }
        } else { // anything else such as src or href
            element[key] = object[key];
        }
    }

    for (let child of object.C instanceof Array && object.C || // C for children
                                     object.C && [object.C] || // only one child
                                     []) {                     // no children
        let result = buildDom(child, elementObject); // recursive
        element.appendChild(result);
    }

    if (Object.keys(elementObject).length) { // one or more K was given
        if (targetObject) { // add elementObject content to targetObject and return the parent element
            for (let key in elementObject) {
                targetObject[key] = elementObject[key];
            }
        } else {
            return elementObject;
        }
    }

    return element;
}

// https://stackoverflow.com/a/37324915/2444105
const intersect2 = (xs,ys) => xs.filter(x => ys.some(y => y === x));
const intersect = (xs,ys,...rest) => ys === undefined ? xs : intersect(intersect2(xs,ys),...rest);

// https://stackoverflow.com/a/45355468/2444105
function range(start, end) {
    return new Array(end - start).fill().map((d, i) => i + start);
}

const obj2qs = obj => Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join('&');

function processGloss(gloss) {
    let infoPatt = /^\[.*\]$/;
    return gloss.match(/\[.*?\]|.+?((?=\[)|$)/g)
        .map(part =>
            infoPatt.test(part) ?
            {E: 'span', className: 'info', C: part} :
            part
        )
        .concat(' ');
}
