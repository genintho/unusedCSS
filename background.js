
var g_ActiveDomain = false;
var g_StyleSheetURLs = [];

var g_DomainSelector = (function(){
    var map = {};

    return {
        processSelector: function( fileSrc, arrSelector ){
            console.log( 'Found ' + arrSelector.length + ' selectors ');
            arrSelector.forEach( function( selector ) {
                if( typeof map[selector] == 'undefined' ){
                    map[selector] = new Selector( selector, fileSrc );
                }
                else{
                    map[selector].addDuplicate( fileSrc );
                }
            });
        },
        reset: function(){
            map = {};
        },
        getMap: function(){
            return map;
        },
        getUnUsed: function(){
            var unused = [];
            for( var i in map ){
                if( !map[i].isUsed ){
                    unused.push( i );
                }
            }
            return unused;
        },
        updateUsage: function( arrSelector ){
            arrSelector.forEach(function( selector ){
                map[selector].setUsed();
            });
        }
    };
})();


chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){
    if( g_ActiveDomain !== false && tab.url ){
        if( tab.url.indexOf( g_ActiveDomain ) !== -1 ){
            getStylesheetFromPage( runTest );
        }
    }
});


chrome.extension.onMessage.addListener( function(request, sender, sendResponse) {
    console.log( 'Background receive command', request.cmd );
    switch( request.cmd ){
        case 'style':
            downloadStylesheet( request.url );
            break;

        case 'getUnusedSelector':
            sendResponse({ data:g_DomainSelector.getUnUsed() });
            break;
            break;

        case 'updateUsage':
            g_DomainSelector.updateUsage( request.data );
            break;

        case 'runTest':
            runTest();
            break;

        case 'setDomain':
            setDomain( request.domain );
            break;

        case 'getResults':
            chrome.tabs.create({
                url: chrome.extension.getURL('results.html')
            });
            break;

        case 'getStats':
            sendResponse( g_DomainSelector.getMap() );
            break;
    }
});


function getStylesheetFromPage( cb ){
    console.log( 'Get stylesheet from the page' );
    chrome.tabs.executeScript(null, { file: "getStyleSheet.js" }, cb);
}


function setDomain( dom ){
    console.log( 'Set domain', dom );
    g_ActiveDomain = dom;
    chrome.tabs.reload();
}


function runTest(){
    console.log( 'runTest' );
    chrome.tabs.executeScript(null, { file: "test.js" },function(){});
}


function downloadStylesheet( urls ){
    console.log( 'Dl stylesheets' );
    urls.forEach( function( url ){

        // already fetched
        if( g_StyleSheetURLs.indexOf(url) !== -1 ){
            console.log( 'Stylesheets', url, ' already downloaded' );
            return;
        }

        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if( ajax.readyState == 4 && ajax.status == 200 ){
                postProcessStyleSheet( url, ajax.responseText );
            }
        }


        // dont fetch that!
        var dataURl = "data:text/css";
        if( url.substr(0, dataURl.length) == dataURl ){
            return;
        }

        console.log( 'DL stylesheet ', url);
        ajax.open( 'GET', url, false);
        ajax.send( null );
        g_StyleSheetURLs.push( url );
    });
}

function postProcessStyleSheet( fileSrc, text ){
    console.log( 'Process stylesheet from ', fileSrc, 'length ', text.length );
    var selectors = extractSelector( text );
    g_DomainSelector.processSelector( fileSrc, selectors );
}

function extractSelector( text ){
    var final = [],
        a = null;

    // empty content of curly bracket
    text = text.replace( /}/g, "}@#@" );

    text = text.replace( /{[\s\S]+?}/mg , "");
    // remove comments
    text = text.replace( /\/\*[\s\S]+?\*\//mg , "");

    // now for selector, remove empty and explode on 'c'
    a = text.split( "@#@" );

    a.forEach(function( e ){
        if( !e.length ){
            return;
        }
        e.split( ',' ).forEach(function( e ){
            if( e.length ){
                final.push( e );
            }
        });
    });

    // return an array of selectors
    return final;
}





