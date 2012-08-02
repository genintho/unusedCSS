var thomas;
chrome.extension.sendMessage({
    cmd: "getStats"
}, function( results ){
    thomas  = results;
    var html = "";
    for( var elem in results ){
        html += "<tr><td>"+ elem +"</td><td>"+ results[elem] +"</td></tr>"
    }
    $("#table" ).html( html );
});







