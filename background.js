
var g_ActiveDomain = false;
var g_MapSelector = {};
var g_StyleSheetURLs = [];


chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){
    console.log( 'tab update' );
    if( g_ActiveDomain !== false && changeInfo.url ){
        if( changeInfo.url.indexOf( g_ActiveDomain ) !== -1 ){
            getStylesheetFromPage( runTest );
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
                for( var i in g_MapSelector ){
                    if( !g_MapSelector[i] ){
                        unused.push( i );
                    }
                }
                sendResponse( {data:unused} );
                break;
            case 'updateUSage':
                request.data.forEach(function( selector ){
                    g_MapSelector[selector] = true;
                });
                break;
            case 'runTest':
                runTest();
                break;

            case 'setDomain':
                setDomain( request.domain );
                break;

            case 'getResults':
                sendResponse( getStatistic() );
                break;
        }
});


function getStylesheetFromPage( cb ){
    console.log( 'get style' );
    chrome.tabs.executeScript(null, { file: "getStyleSheet.js" }, cb);
}

function setDomain( dom ){
    console.log( 'set domain', dom );
    g_ActiveDomain = dom;
    getStylesheetFromPage( runTest );
}

function runTest(){
    console.log( 'runTest' );
    chrome.tabs.executeScript(null, { file: "runTest.js" },function(){});
}


function getStatistic(){
    var nb = 0,
        used=0;

    for( var selector in g_MapSelector ){
        if( g_MapSelector[selector] ){
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
        if( g_StyleSheetURLs.indexOf(url) !== -1 ){
            return;
        }
        console.log( 'dl style ', url);
        ajax.open( 'GET', url, false);
        ajax.send( null );
        g_StyleSheetURLs.push( url );
    });
}

function postProcessStyleSheet( text ){
    console.log( 'process style ' );
    var selectors = extractSelector( text );
    console.log( 'Found '+selectors.length + 'selectors ');
    selectors.forEach( function( selector ) {
        if( typeof g_MapSelector[selector] == 'undefined' ){
            g_MapSelector[selector] = false;
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






