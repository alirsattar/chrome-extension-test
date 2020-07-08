// @ts-check

// alert("Hello from your Chrome extension!");

// import { SettingsManager } from './settings';

class TextReplacer {
  shortcutCodes = [];

  constructor() {
    this.startup();
  }

  async startup() {
    // Check in extension storage for existing 'replacements' object
    // (Awkward syntax / spacing is for development debugging, to easily toggle)
    let existingReplacements
    // = await this.extStorageGet("replacements")
    ;

    if (existingReplacements) {
      // console.log({existingReplacements});
      this.shortcutCodes = existingReplacements;
      // console.log('this.shortcutCodes populated from local: ', this.shortcutCodes);
    } else {
      // TODO: Replace this hard coded value
      const replacementsUrl =
        "https://www.dropbox.com/s/eo1svxzp65oibro/text_replacements.json?dl=1";

      // TODO: Check in localStorage for remote replacements JSON URL

      // If there is one, fetch from there
      if (replacementsUrl) {
        const remoteReplacements = await this.fetchRemoteReplacementsJson(replacementsUrl);

        if (remoteReplacements) {
          this.shortcutCodes = remoteReplacements;
          // console.log('this.shortcutCodes populated from remote: ', this.shortcutCodes);

          this.setJsonReplacements(remoteReplacements);
        }
      }

      // TODO: Else, check in localStorage for stringified replacements data, and use that
    }

    // console.log('this.shortcutCodes coming out of startup(): ', this.shortcutCodes);
  }

  fetchRemoteReplacementsJson(replacementsUrl) {
    if (replacementsUrl) {
      return new Promise((resolve, reject)=> {
        // @ts-ignore
        chrome.runtime.sendMessage(
          {
            contentScriptQuery: "getData",
            url: replacementsUrl,
          },
          (response)=> {
            // debugger;
            if (response != undefined && response != "") {
              // console.warn('response from fetchRemoteReplacementsJson:');
              // console.log( response );
  
              resolve(response);
            } else {
              // debugger;
              reject(new Error("ERROR FETCHING REMOTE REPLACEMENTS JSON"));
            }
          }
        );
      });
    } else {
      console.error('NO REPLACEMENTS URL PROVIDED');
    }
  }

  async setJsonReplacements(replacements) {
    // console.warn("FETCHED REPLACEMENTS FROM REMOTE JSON", replacements);

    // Use JS Set object for easier comparison and filtered adding
    let updatedReplacements = new Set(replacements);

    // Set these replacements in extension storage

    // But first, get current replacements object -- so we can merge new ones into that
    const existingReplacementsResponse = await this.extStorageGet("replacements");

    existingReplacementsResponse.then((replacements)=> {

      console.warn({ replacements });

      updatedReplacements.forEach((replacement)=> {
        updatedReplacements.add(replacement);
      });
    })
    .catch((err)=> {

      console.warn({ err });

      // @ts-ignore
      if (existingReplacementsResponse.error) {
        // @ts-ignore
        console.error(existingReplacementsResponse.error);
      };  
    })

    console.warn('EXISTINGREPLACEMENTS IN SETJSONREPLACEMENTS:');
    console.log({existingReplacements: existingReplacementsResponse});

    // Convert to array for saving
    const replacementsArray = Array.from(updatedReplacements);

    console.warn('UPDATEDREPLACEMENTS AFTER ADDING EXISTING:');
    // console.log(replacementsArray);

    this.extStorageSet('replacements', replacementsArray);
  }

  extStorageSet(fieldString, dataObject) {
    const theValue = dataObject;
    
    const theObjectToSave = {};
    theObjectToSave[fieldString] = theValue;

    console.warn('Value being saved to extension storage:');
    // console.log(theValue);

    // Check that there's some code there.
    if (!theValue) {
      console.error("Error: No value specified");
      return;
    };

    // Save it using the Chrome extension storage API.
    return new Promise((resolve, reject) => {
      // @ts-ignore
      chrome.storage.sync.set(theObjectToSave, function () {
        // Notify that we saved.
        console.warn("Settings saved");
        // console.log(theObjectToSave);
        resolve(theObjectToSave);
      });
    });
  }

  async extStorageGet(fieldNameString) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      chrome.storage.sync.get([fieldNameString], (result)=> {
        // console.log("Value coming back from extension storage is:");
        // console.log(theReplacements);
        
        if (result && result.replacements) {

          // console.log({result});

          // @ts-ignore
          const theReplacements = Object.values(result.replacements);
          resolve(theReplacements);
        } else {

          // console.log({result});
          reject({error: `No extension storage ${fieldNameString} object found`});
        }
      });
    });
  }

  escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  matchValues(fieldValue) {
    let replacedText = fieldValue;

    for (const shortcut of this.shortcutCodes) {
      const thisReplacement = shortcut.phrase;

      const escapedString = this.escapeRegExp(shortcut.shortcut);
      const regExp = new RegExp(escapedString, "gi");
      const match = fieldValue.match(regExp);

      if (match) {
        replacedText = fieldValue.replace(regExp, thisReplacement);
      }
    }

    return replacedText;
  }

  replaceText(event) {
    const keyCode = event.keyCode;

    const inputElementType = event.srcElement.nodeName.toLowerCase();
    let inputFieldValue = event.srcElement.value;

    if (keyCode === 32) {
      // If the event source is an input or text
      if (inputElementType !== "") {
        switch (inputElementType) {
          case "input":
          case "textarea":
            if (inputFieldValue) {
              const textWithReplacements = this.matchValues(inputFieldValue);

              if (textWithReplacements !== inputFieldValue) {
                event.srcElement.value = textWithReplacements;
              }
            }
            break;
        }
      }
    }
  }
};

class SettingsManager {

  constructor() {
    // console.log('SETTINGSMANAGER CLASS ISNTANTIATED');
  }

  testFunction(event) {
    event.preventDefault();

    console.log('TESTFUNCTION FIRED');
  }

  // CREATE: Save URL and edited shortcut list

  // RETRIEVE: Get URL and edited shortcut list

  // UPDATE: Save changes to URL and shortcut list

  // DELETE: Clear URL, shortcut list
};

const replacer = new TextReplacer();
const settingsManager = new SettingsManager();

// console.log({ replacer, settingsManager });

window.addEventListener("keyup", (event)=> replacer.replaceText(event));

window.onload = () => {

  // console.log('ANYTHING');

  const saveButton = document.getElementById('replacer-save-button');

  if (saveButton) {

    console.log('SAVE BUTTON PRESENT');

    saveButton.addEventListener('click', settingsManager.testFunction);
  };
};
