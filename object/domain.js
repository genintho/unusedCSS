/**
 * Domain module
 *
 * We work one domain at a time so we need a "singleton" domain
 *
 * It store the list of selector we have found and there state
 */
var mDomain = (function(){
    var _selectorMap = {};
    var _isActive = false;
    var _stylesheetMap = {};

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
                if( typeof _selectorMap[selector] == 'undefined' ){
                    ct++;
                    _selectorMap[selector] = new Selector( selector, fileSrc );
                }
                else{
                    _selectorMap[selector].addDuplicate( fileSrc );
                }
            });
            console.log( fileSrc, 'contained ', arrSelector.length, ' with ', arrSelector.length-ct, 'duplicate' );
        },
        getName: function(){
            return _isActive;
        },
        isActive: function(){
            return _isActive === false ? false : true;
        },
        reset: function(){
            _selectorMap = {};
            _stylesheetMap = {};
        },
        getMap: function(){
            return _selectorMap;
        },
        getUnUsed: function(){
            var unused = [];
            for( var i in _selectorMap ){
                if( !_selectorMap[i].isUsed ){
                    unused.push( i );
                }
            }
            return unused;
        },

        set: function( domain ){
            _isActive = domain;
            this.reset();
        },

        updateUsage: function( arrSelector ){
            arrSelector.forEach(function( selector ){
                _selectorMap[selector].setUsed();
            });
        }
    };
})();