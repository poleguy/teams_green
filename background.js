try {
    //importScripts('src/js/ExtPay.js');
    importScripts('src/js/script.js');
    //const extpay = ExtPay('microsoft-teams-always-available');
    //extpay.startBackground();
    console.log(`loaded`);

    const url = chrome.runtime.getURL('./status.json');

    //chrome.runtime.getPackageDirectoryEntry(function(storageRootEntry) {
    //    fileExists(storageRootEntry, filename, function(isExist) {
     //       if(isExist) {
    //            /* your code here */
    //        }
    //    });
    //});
    
    fetch(url)
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                                response.status);
                    return;
                }
    
                // Examine the text in the response
                response.json().then(function(data) {
                    console.log('worked okay?');
                    console.log(data);
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    
//    checkFile();
    console.log(`loaded complete`);
    


} catch (e) {
    console.error(e);
}
