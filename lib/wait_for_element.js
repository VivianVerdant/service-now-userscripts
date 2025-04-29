let animationCounter = 0;

function wait_for_element(selector, func, once, parent){
    parent = parent || document;
    once = (once == undefined ? true : false);
    if (once) {
        _wait_for_element_once(parent, selector).then(func);
    } else {
        _wait_for_element(parent, selector, func);
    }
}

function _wait_for_element_once(parent, selector) {
    return new Promise((resolve) => {
        const elem = parent.querySelector(selector);

        if (elem) {
            resolve(elem); // already in the DOM
            return
        }

        const animationName = `waitForElement__${animationCounter++}`;

        const style = document.createElement("style");

        const keyFrames = `
      @keyframes ${animationName} {
        from { opacity: 1; }
        to { opacity: 1; }
      }
      ${selector} {
        animation-duration: 1ms;
        animation-name: ${animationName};
      }
    `;

        style.appendChild(new Text(keyFrames));

        document.head.appendChild(style);

        const eventListener = (event) => {
            if (event.animationName === animationName) {
                cleanUp();
                resolve(event.target);
            }
        };

        function cleanUp() {
            document.removeEventListener("animationstart", eventListener);
            document.head.removeChild(style);
        }

        document.addEventListener("animationstart", eventListener, false);
    });
}

function _wait_for_element(parent, selector, func) {
    const elem = parent.querySelectorAll(selector);

    const animationName = `waitForElement__${animationCounter++}`;

    const style = document.createElement("style");

    const keyFrames = `
      @keyframes ${animationName} {
        from { opacity: 1; }
        to { opacity: 1; }
      }
      ${selector} {
        animation-duration: 1ms;
        animation-name: ${animationName};
      }
    `;

    style.appendChild(new Text(keyFrames));

    document.head.appendChild(style);

    const eventListener = (event) => {
        if (event.animationName === animationName) {
            func(event.target);
        }
    };

    document.addEventListener("animationstart", eventListener, false);
}
