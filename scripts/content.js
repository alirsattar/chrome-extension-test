// alert("Hello from your Chrome extension!");

const shortcutCodes = {
  ":ascii": "¯\\_(ツ)_/¯"
};

const matchValues = (fieldValue)=> {
  const shortcutObjectKeys = Object.keys(shortcutCodes);  
  let replacedText = fieldValue;

  for (const shortcut of shortcutObjectKeys) {
    const regExp = new RegExp(shortcut, 'gi');
    const match = fieldValue.match(regExp);

    if (match) {
      const matchedKey = match[0];
      const matchedValue = shortcutCodes[matchedKey];

      const matchedKeyRegExp = new RegExp(match[0], 'gi');      
      replacedText = fieldValue.replace(matchedKeyRegExp, matchedValue);
    };
  };

  return replacedText;
};

const replaceText = (event)=> {
  const keyCode = event.keyCode;

  console.log({ keyPressed: keyCode });

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

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {

//     console.log({ request, sender, sendResponse });

//     if( request.message === "clicked_browser_action" ) {
//       var firstHref = $("a[href^='http']").eq(0).attr("href");

//       console.log({firstHref});
//     }
//   }
// );
