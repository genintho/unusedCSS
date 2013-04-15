var links = document.getElementsByTagName('link');
links = Array.prototype.slice.call( links );

var stylesheetURL = [];
links.forEach( function( link ){
    if( link.rel == 'stylesheet' || link.type == 'text/css' ){
        if( typeof link.href != 'undefined' ){
            stylesheetURL.push( link.href );
        }
    }
});

chrome.extension.sendMessage({
    cmd: "returnStylesheetURL",
    url: stylesheetURL
});