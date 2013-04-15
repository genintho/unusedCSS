/**
 * Domain module
 *
 * We work one domain at a time so we need a "singleton" domain
 *
 * It store the list of selector we have found and there state
 */
var mDomain = (function(){
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