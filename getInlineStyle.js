// this content script is returning the content of every inline <style> tag found

var final = [];
var styleTAGs = document.getElementsByTagName( 'style' );

for( var i = 0, l=styleTAGs.length; i<l; i++ ){
    final.push( styleTAGs[i].innerHTML );
}

chrome.extension.sendMessage({
    cmd: "returnInlineStyle",
    styles: final
});