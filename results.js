var g_results;
chrome.extension.sendMessage({
    cmd: "getStats"
}, function( results ){
    g_results  = results;
    var nb = 0, used = 0, duplicate = 0;
    for( var elem in results ){
        nb++;
        if( results[elem].isUsed ){
            used++;
        }
        if( results[elem].isDuplicate ){
            duplicate++;
        }
    }
    document.getElementById( "res" ).innerHTML =
        '<table>' +
            '<tbody>' +
                '<tr><td>Number</td><td>'+ nb +'</td></tr>' +
                '<tr><td>Used</td><td>'+ used +'</td></tr>' +
                '<tr><td>Unused</td><td>'+ (nb -used)+'</td></tr>' +
                '<tr><td>Duplicate</td><td>'+ duplicate +'</td></tr>' +
            '</tbody>' +
        '</table>'
    ;
});


document.getElementById('show' ).addEventListener('click',function(){
    var html = "";
    for( var elem in g_results ){
        html += "<tr class='";
        if( g_results[elem].isUsed ){
            html += 'green';
        }
        else{
            html += 'red';
        }
        html += "'><td>"+ elem +"</td><td>"+ g_results[elem].isUsed +"</td><td>"+ g_results[elem].src +"</td></tr>"
    }
    document.getElementById( "table" ).innerHTML = html;
});






