// @ts-check

// alert("Hello from your Chrome extension!");

const startup = ()=> {
  // Check in localStorage for remote replacements JSON URL
  const replacementsUrl = 'https://www.dropbox.com/s/eo1svxzp65oibro/text_replacements.json?dl=1';

  // If there is one, fetch from there
  if (replacementsUrl) {
    fetchRemoteReplacementsJson(replacementsUrl);
    return;
  }

  // Else, check in localStorage for stringified replacements data, and use that
};

const fetchRemoteReplacementsJson = (replacementsUrl)=> {
  chrome.runtime.sendMessage(
    {
        contentScriptQuery: "getData",
        url: replacementsUrl
    }, function (response) {
        // debugger;
        if (response != undefined && response != "") {
          console.warn({ response });
          setJsonReplacements(response);
        }
        else {
            // debugger;
            throw new Error('ERROR FETCHING REMOTE REPLACEMENTS JSON');
        }
    }
  )
};

let shortcutCodes;

// [
//   {
//     'replacement': '¯\\_(ツ)_/¯',
//     'shortcut': ':ascii'
//   },
//   {
//     "replacement":"➔",
//     "shortcut": "—>"
//   }
// ];

const setJsonReplacements = (replacements)=> {
  console.warn('FETCHED REPLACEMENTS FROM REMOTE JSON', replacements);
  shortcutCodes = replacements;
};

const escapeRegExp = (str)=> {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

const matchValues = (fieldValue)=> {
  let replacedText = fieldValue;

  for (const shortcut of shortcutCodes) {
    const thisReplacement = shortcut.replacement;

    const escapedString = escapeRegExp(shortcut.shortcut);
    const regExp = new RegExp(escapedString, 'gi');
    const match = fieldValue.match(regExp);

    if (match) {
      replacedText = fieldValue.replace(regExp, thisReplacement);
    };
  };

  return replacedText;
};

const replaceText = (event)=> {


  const keyCode = event.keyCode;

  const inputElementType = event.srcElement.nodeName.toLowerCase();
  let inputFieldValue = event.srcElement.value;

  if (keyCode === 32) {
    // If the event source is an input or text
    if (inputElementType !== "") {
      switch (inputElementType) {
        case 'input':
        case 'textarea':
          if (inputFieldValue) {
            const textWithReplacements = matchValues(inputFieldValue);
  
            if (textWithReplacements !== inputFieldValue) {
              event.srcElement.value = textWithReplacements;
            };
          };
          break;
      }
    };
  };
};

window.addEventListener('keyup', replaceText);
window.onload = ()=>{
  startup();
};

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {

//     console.log({ request, sender, sendResponse });

//     if( request.message === "clicked_browser_action" ) {
//       var firstHref = $("a[href^='http']").eq(0).attr("href");

//       console.log({firstHref});
//     }
//   }
// );
