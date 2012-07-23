chrome.tabs.getSelected(null,function(tab) {
    var link = tab.url;
    var protocol = link.substr( 0, link.indexOf('://') );
    var minusProto = link.substr( link.indexOf('://')+3 );
    if( link.indexOf('/') !== -1 ){
        minusProto = minusProto.substr( 0, minusProto.indexOf('/') );
    }
    if( minusProto.indexOf('?') !== -1 ){
        minusProto = minusProto.substr( 0, minusProto.indexOf('?') );
    }
    if( minusProto.indexOf('#') !== -1 ){
        minusProto = minusProto.substr( 0, minusProto.indexOf('#') );
    }
    document.getElementById('domain' ).value = protocol + '://' + minusProto ;
});


document.getElementById('setDomain' ).addEventListener('click', function(){
    chrome.extension.sendMessage({
        cmd: "setDomain",
        domain: document.getElementById('domain' ).value
    });
});

document.getElementById('test' ).addEventListener( 'click', function(){
    chrome.extension.sendMessage({
        cmd: "test"
    });
});

document.getElementById('getResults' ).addEventListener( 'click', function(){
    chrome.extension.sendMessage({
        cmd: "getResults"
    },function( rep ){
        document.getElementById('msg' ).innerHTML = rep.total +'<br/>'+ rep.used + '<br/>'+ (rep.used/rep.total);
    });
});