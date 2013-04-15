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

    /**
     * Clear the current state
     *
     * @private
     */
    function  _reset(){
        _selectorMap = {};
        _stylesheetMap = {};
    }

    return {
        /**
         * Add an aray of selector to the domain
         *
         * @param {String}  fileSrc     Where the selector are coming form
         * @param {ArraY}   arrSelector List of selector to add
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

        /**
         * Get the domain name that we are working on
         *
         * @returns {string}
         */
        getName: function(){
            return _isActive;
        },

        /**
         * Do we have an active domain?
         *
         * @returns {boolean}
         */
        isActive: function(){
            return _isActive === false ? false : true;
        },

        /**
         * Return the map of selector
         *
         * @returns {{}}
         */
        getMap: function(){
            return _selectorMap;
        },

        /**
         * Return the list of unused selector
         *
         * @returns {Array}
         */
        getUnUsed: function(){
            var unused = [];
            for( var i in _selectorMap ){
                if( !_selectorMap[i].isUsed ){
                    unused.push( i );
                }
            }
            return unused;
        },

        /**
         * Set the active domain
         * @param {String} domain
         */
        set: function( domain ){
            _isActive = domain;
            _reset();
        },

        /**
         * Update the usage of the provided selector
         *
         * @param {Array} arrSelector
         */
        updateUsage: function( arrSelector ){
            arrSelector.forEach(function( selector ){
                _selectorMap[selector].setUsed();
            });
        }
    };
})();