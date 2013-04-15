

    chrome.extension.sendMessage({
        cmd: "getUnusedSelector"
    },function( rep ){
        var used = [];
        rep.data.forEach( function( selector ){
            try{// try catch for the weirdness
                var e = document.querySelectorAll( selector );
                if( e.length ){
                    used.push( selector );
                }
            }catch( e ){}
        });
        chrome.extension.sendMessage({
            cmd: "updateUsage",
            data: used
        });
    });

