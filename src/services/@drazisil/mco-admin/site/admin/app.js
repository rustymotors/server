'use strict';

const domContainer = document.querySelector('#app');

let contentHTML = domContainer.innerHTML
domContainer.innerHTML = contentHTML.concat(`<span onClick="goHome('/api/')">hey!</span>`)
// domContainer.innerHTML = domContainer.innerHTML

/**
 * @param {string} url
 */
function goHome(url) {
    document.location.href = url
}
