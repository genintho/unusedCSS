var domain = false;
var mapSelector = {};

var urlDl = [];

function getStylesheet( cb ){
    console.log( 'get style' );
    chrome.tabs.executeScript(null, { file: "getStyleSheet.js" }, cb);
}

function setDomain( dom ){
    console.log( 'set domain', dom );
    domain = dom;
    getStylesheet( test );
}

function test(){
    console.log( 'test' );
    chrome.tabs.executeScript(null, { file: "test.js" },function(){});
}

chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){
    console.log( 'tab update' );
    if( domain !== false && changeInfo.url ){
        if( changeInfo.url.indexOf( domain ) !== -1 ){
            getStylesheet( test );
        }
    }
});

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch( request.cmd ){
            case 'style':
                downloadStylesheet( request.url );
                break;
            case 'getUnusedSelector':
                var unused = [];
                for( var i in mapSelector ){
                    if( !mapSelector[i] ){
                        unused.push( i );
                    }
                }
                sendResponse( {data:unused} );
                break;
            case 'updateUSage':
                request.data.forEach(function( selector ){
                    mapSelector[selector] = true;
                });
                break;
            case 'test':
                test();
                break;

            case 'setDomain':
                setDomain( request.domain );
                break;

            case 'getResults':
                sendResponse( calcPercentUsage() );
                break;
        }
});

function calcPercentUsage(){
    var nb = 0, used=0;
    for( var i in mapSelector ){
        if( mapSelector[i] ){
            used++;
        }
        nb++;
    }
    return {
        total: nb,
        used: used
    };
}


function downloadStylesheet( urls ){
    console.log( 'dl style');
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if( ajax.readyState == 4 && ajax.status == 200 ){
            postProcessStyleSheet( ajax.responseText );
        }
    }
    urls.forEach( function( url ){
        if( urlDl.indexOf(url) !== -1 ){
            return;
        }
        console.log( 'dl style ', url);
        ajax.open( 'GET', url, false);
        ajax.send( null );
        urlDl.push( url );
    });
}

function postProcessStyleSheet( text ){
    console.log( 'process style ' );
    var selectors = extractSelector( text );
    console.log( 'Found '+selectors.length + 'selectors ');
    selectors.forEach( function( selector ) {
        if( typeof mapSelector[selector] == 'undefined' ){
            mapSelector[selector] = false;
        }
    });
}

function extractSelector( text ){
    var a = text.length;
    // empty content of curly bracket
    text = text.replace( /{[\s\S]+?}/mg , "");
    // remove comments
    text = text.replace( /\/\*[\s\S]+?\*\//mg , "");
    // return an array of selectors
    return text.split( "\n" );
}






