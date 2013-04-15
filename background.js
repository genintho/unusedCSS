
var g_ActiveDomain = false;
var g_StyleSheetURLs = [];

var g_DomainSelector = (function(){
    var map = {};

    return {
        /**
         *
         * @param fileSrc
         * @param arrSelector
         */
        addSelectors: function( fileSrc, arrSelector ){
            console.log( 'Add ' + arrSelector.length + ' selectors from ',fileSrc);
            var ct = 0;
            arrSelector.forEach( function( selector ) {
                if( typeof map[selector] == 'undefined' ){
                    ct++;
                    map[selector] = new Selector( selector, fileSrc );
                }
                else{
                    map[selector].addDuplicate( fileSrc );
                }
            });
            console.log( fileSrc, 'contained ', arrSelector.length, ' with ', arrSelector.length-ct, 'duplicate' );
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
        case 'returnStylesheetURL':
            downloadStylesheet( request.url );
            break;

        case 'returnInlineStyle':
            processInlineStyles( request.styles );
            break;

        case 'getUnusedSelector':
            sendResponse({ selectors: g_DomainSelector.getUnUsed() });
            break;
            break;

        case 'updateUsage':
            g_DomainSelector.updateUsage( request.selectors );
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
    chrome.tabs.executeScript(null, { file: "contentScript/getStyleSheetURL.js" }, cb);
    chrome.tabs.executeScript(null, { file: "contentScript/getInlineStyle.js" }, cb);
}


function setDomain( dom ){
    console.log( 'Set domain', dom );
    g_ActiveDomain = dom;
    g_DomainSelector.reset();
    chrome.tabs.reload();
}


function runTest(){
    console.log( 'runTest' );
    chrome.tabs.executeScript(null, { file: "contentScript/testSelector.js" },function(){});
}

function processInlineStyles( arrText ){
    console.log('Found ', arrText.length, 'inline style');
    arrText.forEach( function( e ){
        postProcessStyleSheet( 'inline', e );
    });
}

/**
 * Download stylesheets
 *
 * @param {Array} urls
 */
function downloadStylesheet( urls ){
    console.log( 'Found ', urls.length, 'stylesheet to download' );
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

/**
 * Handle a blobl of css selector
 *
 * @param {string} fileSrc  Where this blob is coming from
 * @param {stirng} text     The css blob
 */
function postProcessStyleSheet( fileSrc, text ){
    console.log( 'Process stylesheet from ', fileSrc, 'length ', text.length );
    var selectors = extractSelector( text );
    g_DomainSelector.addSelectors( fileSrc, selectors );
}

/**
 * Extract the selector from a string
 *
 * @TODO ignore the :before, :hover, ...
 *
 * @param {String} text
 * @returns {Array}
 */
function extractSelector( text ){
    var foundSelectors = [],
        selectorGroup = [];

    // replace } with a macro, that we are going to split on
    text = text.replace( /}/g, "}@#@" );

    // empty content of curly bracket
    text = text.replace( /{[\s\S]+?}/mg , "");

    // remove comments
    text = text.replace( /\/\*[\s\S]+?\*\//mg , "");

    // now for selector, remove empty and explode on 'c'
    selectorGroup = text.split( "@#@" );

    selectorGroup.forEach(function( selectors ){
        if( !selectors.length ){
            return;
        }
        selectors.split( ',' ).forEach(function( selector ){
            if( selector.length ){
                foundSelectors.push( selector );
            }
        });
    });

    // return an array of selectors
    return foundSelectors;
}





