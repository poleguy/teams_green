const alarmName = 'forceTeamsAvailability';

chrome.runtime.onInstalled.addListener(async () => {
    chrome.alarms.create(alarmName, { periodInMinutes: .105 });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === alarmName) {
        const url = chrome.runtime.getURL('./status.json');
    
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
                        if (data.status == "available") {
                            runForceAvailability(data.status);
                        } else {
                            console.log("busy... doing nothing");
                        }
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
        
        //    checkFile();
        console.log(`check status complete`);

        
    }
});



const requestForceAvailability = function () {
    chrome.storage.sync.get(['isEnabled', 'statusType', 'requestCount', 'startTime', 'endTime', 'onlyRunInTimeWindow', 'paid'], async storage => {
        let {
            isEnabled,
            statusType,
            requestCount,
            startTime,
            endTime,
            onlyRunInTimeWindow,
            paid
        } = storage;
        if (requestCount === undefined) {
            console.log(`Resetting request count`);
            chrome.storage.sync.set({ requestCount: 0 }, () => { });
            requestCount = 0;
        }
        console.log(`count: ${requestCount}`);
        console.log(`status: ${statusType}`);

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

        
        if (!statusType) {
            chrome.storage.sync.set({ statusType: 'Available' }, () => { });
            statusType === 'Available';
        }
        //if (!paid) {
        //    console.log('User does not have an access');
        //    return;
        //}

        if (isEnabled || isEnabled === undefined) {
            console.log(`startTime: ${startTime}`);
            console.log(`endTime: ${endTime}`);
            if (onlyRunInTimeWindow && startTime && endTime) {
                const currentDate = new Date();
                const startDate = new Date(currentDate.getTime());
                startDate.setHours(startTime.split(':')[0]);
                startDate.setMinutes(startTime.split(':')[1]);
                startDate.setSeconds('00');

                const endDate = new Date(currentDate.getTime());
                endDate.setHours(endTime.split(':')[0]);
                endDate.setMinutes(endTime.split(':')[1]);
                endDate.setSeconds('00');
                const isBetween = startDate < currentDate && endDate > currentDate;
                if (!isBetween) {
                    console.log('onlyRunInTimeWindow set to true and current time is not in inputted window');
                    return;
                } else {
                    console.log('onlyRunInTimeWindow set to true and time is in window! Running force availability...')
                }

            }
            // https://stackoverflow.com/questions/61879820/how-can-i-update-presence-status-availability-in-ms-teams-via-an-api-call
            try {
                const options = {
                    authProvider,
                };

                const client = Client.init(options);
                
                let user = await client.api('/me')
                    .get();

                const latestOid = localStorage['ts.latestOid'];
                console.log(`MS Teams Available if Screen On latestOid: ${latestOid}`);
                if (latestOid === undefined) {
                    throw 'latestOid undefined'
                }
                const tokenJSON = localStorage[`ts.${latestOid}.cache.token.https://presence.teams.microsoft.com/`];
                console.log(`MS Teams Available if Screen On tokenJSON: ${tokenJSON}`);
                if (tokenJSON === undefined) {
                    throw 'tokenJSON undefined'
                }
                const token = JSON.parse(tokenJSON).token;
                const response = await fetch('https://presence.teams.microsoft.com/v1/me/forceavailability/', {
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    'body': `{"availability":"${statusType}"}`,
                    'method': 'PUT'
                });
                if (response.ok) {
                    requestCount += 1;

                    chrome.storage.sync.set({ requestCount: requestCount }, () => { });
                }
                console.log('MS Teams Available if Screen On:');
                console.log(response);
            } catch (e) {
                console.log(`MS Teams Available if Screen On: HTTP req failed to /forceavailability: ${e}`);
            }
        } else {
            console.log('MS Teams Available if Screen On: currently disabled');
        }
    });
};



function fileExists(storageRootEntry, fileName, callback) {
  storageRootEntry.getFile(fileName, {
    create: false
  }, function() {
    callback(true);
  }, function() {
    callback(false);
  });
}

function LinkCheck(url)
{
//    var http = new XMLHttpRequest();
//    http.open('HEAD', url, false);
//    http.send();
//    return http.status!=404;
}

const checkFile = function () {

    //var x=LinkCheck("https://poleguy.com/index.html");
    var x=LinkCheck("/tmp");

    x ? alert("File Exists") : 
        alert("File Doesn't exist") ; 
    if (x){ 
        alert("File Exists"); 
    } 
    else {
        alert("File Doesn't exist"); 
    }
};
//Unfortunately, I tried this on my system and 
//it fails after the line: http.open('HEAD', url,
//false); –


// https://github.com/saltafossi/MSTeamsWebStatus/blob/main/Presence_Modifier.user.js


// ==UserScript==
// @name         Web Based Microsoft Teams Presence Modifier
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modifica lo status dell'utente collegato alla versione web di Teams attiva sul browser
// @author       instance.id
// @match        https://*.teams.microsoft.us/*
// @grant        none
// ==/UserScript==


const setActive = function () {
  console.log('fuk u teams');
    const getAuthToken = function () {
        for(const i in localStorage) {
            if(i.startsWith("ts.") && i.endsWith("cache.token.https://presence.teams.microsoft.com/")) {
                console.log(JSON.parse(localStorage[i]).token);
                return JSON.parse(localStorage[i]).token;
                //return 'wrong';
            }
        }
    }
  fetch("https://presence.teams.microsoft.com/v1/me/forceavailability/", {
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    "body": '{"availability":"Available"}',
    "method": "PUT"
  })
  .then(response => console.log(`Got fuked: ${response.statusText}`))

}


//setInterval(makeActive, 15*1000);
//makeActive()

const setActive2 = function() {
    console.log(`set active`);
    makeActive();
    console.log(`set active done`);
    
}

const runForceAvailability = async function (status) {
    console.log(`status from disk: ${status}`);
    // https://stackoverflow.com/questions/17567624/pass-a-parameter-to-a-content-script-injected-using-chrome-tabs-executescript
    chrome.tabs.query({ 'url': 'https://teams.microsoft.com/*' }, function (items) {
        for (tab of items) {
            console.log(`tab found: ${tab.url}`);
            //            chrome.scripting.executeScript({ target: { tabId: tab.id }, function: setActive }, () => { });
            //chrome.scripting.executeScript({ target: { tabId: tab.id }, function: requestForceAvailability }, () => { });
            chrome.scripting.executeScript({ target: { tabId: tab.id }, function: setActiveIfIdle }, () => { });
            break;
        }
    });
}





// ==UserScript==
// @name         Web Based Microsoft Teams Presence Observer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Osserva lo status dell'utente collegato alla versione web di Teams attiva sul browser
// @author       FranCesco
// @match         *://*.teams.microsoft.com/*
// @grant        none
// ==/UserScript==



const setActiveIfIdle = async function () {
    // check current status. If Idle, set to active.

    const checkStatus = function () {
        console.log('in checkStatus')
        let $ = window.jQuery;
        'use strict';

        const INTERVAL = 5000;
        let currentStatus = ''
        let settingData = ''

        let status = document.querySelector("span.ts-skype-status");
        console.log(status.title)
    
        if (currentStatus == status.title) { return; }

//        alert('==Current Status: ' + status.title)

        if (status != null && (status.title == 'In a call' || status.title == 'Busy' || status.title == 'In a meeting')) {
            currentStatus = status.title;
            console.log('Busy, turn Zigbee light on!');
            settingData = 'on';
        } else {
            currentStatus = status.title;
            console.log('Not busy, turn Zigbee light off!');
            settingData = 'off';
        }

//        $.ajax({
//            type: "POST",
//            url: "http://localhost/teams_status",
//            data: {
//                status: currentStatus,
//                set: settingData
//            },
//            success: function (data) {
//                console.log(data);
//            },
//            dataType: "json"
        //        });

        return status.title;
    };

    console.log('in setActiveIfIdle');
    stat = checkStatus();
    console.log(stat);
    console.log('checked status');


    if (stat != "Available") {
        console.log("setting active")
        setActive();
        console.log("now active")
    } else {
        console.log("already active")
    }



}
