

function Selector( str, fileSrc ){
    var _duplicate = false,
        _src = fileSrc;

    return {
        name: str,
        src: fileSrc,
        isUsed: false,
        isDuplicate: false,

        addDuplicate: function( fileSrc ){
            if( fileSrc == 'inline' ){
                return;
            }
            if( _duplicate === false ){
                _duplicate = [ _src ];
                this.isDuplicate = true;
            }
            _duplicate.push( fileSrc );
        },
        setUsed: function(){
            this.isUsed = true
        }
    };
}