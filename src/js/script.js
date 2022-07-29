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
                    response.json()
                        .then(function(data) {
                            console.log('status from disk:');
                            console.log(data);
                            if (data.status == "available") {
                                runForceAvailability(data.status);
                            } else {
                                console.log("busy... doing nothing");
                            }
                        })
                        .catch(function(err) {
                            console.log('SyntaxError: Unexpected end of JSON input?... file was probably being updated when read:Ignoring.');
                        });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
        
    }
});


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

const runForceAvailability = async function (status) {
    //console.log(`status from disk: ${status}`);
    // https://stackoverflow.com/questions/17567624/pass-a-parameter-to-a-content-script-injected-using-chrome-tabs-executescript
    chrome.tabs.query({ 'url': 'https://teams.microsoft.com/*' }, function (items) {
        for (tab of items) {
            console.log(`tab found: ${tab.url}`);
            //            chrome.scripting.executeScript({ target: { tabId: tab.id }, function: setActive }, () => { });
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
    // check status and update to active if status is not "in a call" etc.
    //console.log('in setActiveIfIdle')
    let $ = window.jQuery;
    'use strict';
    
    let status = document.querySelector("span.ts-skype-status");
    //console.log(status.title)
    //alert('==Current Status: ' + status.title)

    if (status != null && (status.title == 'In a call' || status.title == 'Busy' || status.title == 'In a meeting')) {
        currentStatus = status.title;
        console.log('State is busy.');
        // turnOnPhysicalLight()
    } else {
        currentStatus = status.title;
        console.log('State is not busy.');
        // turnOffPhysicalLight()

        // now modify normal behavior to keep teams green, not yellow
        if (currentStatus != "Available") {
            console.log("Setting teams green...")
            setActive();
        } else {
            // console.log("already active... doing nothing")
        }


    }
}
