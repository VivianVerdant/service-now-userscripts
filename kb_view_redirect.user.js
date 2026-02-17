// ==UserScript==
// @name         KB View Redirect
// @namespace    http://tampermonkey.net/
// @version      v1.0.0
// @description  make ugly less ugly
// @author       Vivian
// @match        https://virteva.service-now.com/kb_view.do*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const params = new URLSearchParams(document.location.search);
    const sys_id = params.get("sys_kb_id");
    window.location.replace(`https://virteva.service-now.com/kb?sys_kb_id=${sys_id}&id=kb_article_view`);

})();
