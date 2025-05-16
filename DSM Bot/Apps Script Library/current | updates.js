function checkForUpdates() {
  var sheetVersion = parseInt(PropertiesService.getDocumentProperties().getProperty("sheetVersion"));
  var scriptVersion = parseInt(PropertiesService.getDocumentProperties().getProperty("scriptVersion"));

  if (!sheetVersion || isNaN(sheetVersion)) {
    sheetVersion = 1;
    PropertiesService.getDocumentProperties().setProperty("sheetVersion", sheetVersion);
    console.log("Sheet version loaded to sheet properties!");
  }
  if (!scriptVersion || isNaN(scriptVersion)) {
    scriptVersion = 1;
    PropertiesService.getDocumentProperties().setProperty("scriptVersion", scriptVersion);
    console.log("Script version loaded to sheet properties!");
  }


  if (scriptVersion == ogScriptVersion && sheetVersion == ogSheetVersion) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`No updates available currently.`, "Latest!");
    return;
  }

  if (sheetVersion !== ogSheetVersion) {
    console.log(`Update available to Sheet v${ogSheetVersion}`);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(`Update available to Sheet v${ogSheetVersion}.`, `Spreadsheet update available to a new version.\n\nCurrent Sheet Version: v${sheetVersion}\nUpdate Version: v${ogSheetVersion}\n\nUpdate sheet to new version?`, ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      updateToNewSheet();
      Utilities.sleep(2000);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Update did not proceed for v${ogSheetVersion}.`, "Failure");
    }

    var updatedVersion = parseInt(PropertiesService.getDocumentProperties().getProperty("sheetVersion"));

    if (updatedVersion == ogSheetVersion) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Update completed for spreadsheet to v${ogSheetVersion}.`, "Success");
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Update failed while trying to upgrade sheet to v${ogSheetVersion}.`, "Failed");
    }

  }
  if (scriptVersion !== ogScriptVersion) {
    console.log(`Update available to Script v${ogScriptVersion}`);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(`Update available to Script v${ogScriptVersion}.`, `Script update available to a new version.\n\nCurrent Script Version: v${scriptVersion}\nUpdate Version: v${ogScriptVersion}\n\nUpdate script to new version?`, ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      var scriptId = ScriptApp.getScriptId();
      updateToNewScript(scriptId);
      Utilities.sleep(2000);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Update did not proceed for v${ogScriptVersion}.`, "Failure");
    }

    var updatedVersion = parseInt(PropertiesService.getDocumentProperties().getProperty("scriptVersion"));

    if (updatedVersion == ogScriptVersion) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Update completed for script to v${ogScriptVersion}.`, "Success");
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Update failed while trying to upgrade script to v${ogScriptVersion}.`, "Failed");
    }

  }
}

function updateToNewSheet() {

  try {
    //New update functions
    syncControlCenterUpdates1();
    Utilities.sleep(1000);

  } catch (e) {
    console.log(e);
    return;
  }

}

function updateToNewScript(scriptId) {
  var templateScriptId = "1UYxaicpe0ICA2XUND2JwLTMxYd9GhHBU8OoKDaT-WIESYohzcM0-7Vng";
  var amritsBotScriptID = "1bpvUvzOKbBHFkuzMARbzvCYGApNBBSHUaHMA9yfMIrhyc3yDLBkqpMf9";

  var sourceUpdatedScriptId = (scriptId === templateScriptId) ? amritsBotScriptID : templateScriptId;
  var toUpdateScriptId = scriptId;

  try {
    const parameters = {
      "sourceUpdatedScriptId": sourceUpdatedScriptId,
      "toUpdateScriptId": toUpdateScriptId,
      "isTemplateUpdate": (scriptId === templateScriptId) ? true : false
    };

    var payload = JSON.stringify(parameters);

    const options = {
      method: 'POST',
      contentType: 'application/json', // Set content type to JSON
      payload: payload
    };

    try {
      var response = UrlFetchApp.fetch('https://hook.eu1.make.com/ipgii1iz17aa0ayjbmfgmreyea5i3zu6', options);

      if (response.getContentText().includes("Updated Script.")) {
        PropertiesService.getDocumentProperties().setProperty("scriptVersion", ogScriptVersion);

        if (scriptId === templateScriptId) {
          admin_SetTemplateVersion(false, true, true);
        }
      }
    } catch (e) {
      console.log("Could Not Update Script Due to " + e);
    }

    Utilities.sleep(1000);

  } catch (e) {
    console.log(e);
    return;
  }
}

function syncChangelogUpdates(spreadsheetID = SpreadsheetApp.getActiveSpreadsheet().getId()) {
  var templateChangelogSheet = SpreadsheetApp.openById("1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8").getSheetByName("Changelog");
  var mySpreadsheet = SpreadsheetApp.openById(spreadsheetID);
  var myChangelogSheet = mySpreadsheet.getSheetByName("Changelog");

  if (mySpreadsheet.getId() === "1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8") {
    mySpreadsheet.toast("Sync operation not allowed on the template sheet!");
    console.log("Sync operation not allowed on the template sheet!");
    return;
  }

  if (myChangelogSheet) {
    mySpreadsheet.deleteSheet(myChangelogSheet);
  }

  templateChangelogSheet.copyTo(mySpreadsheet).setName("Changelog").activate();

  console.log("Updates Synced.");
  if (Session.getActiveUser().getEmail() !== 'amrit.dash@axelerant.com') {
    mySpreadsheet.toast("Updated Changelog Sheet.");
  }
}

//UPDATE | SHEET VERSION #2
//Update Name: Add feature for Turn Off Leave Reminder

//Sheet Name: Control Center
//Updated Range: New Row 17
//Old Range Migrated: B2:B8, B12:B16

function syncControlCenterUpdates1(spreadsheetID = SpreadsheetApp.getActiveSpreadsheet().getId()) {
  var updatedControlCenterSheet = SpreadsheetApp.openById("1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8").getSheetByName("Control Center");
  var mySpreadsheet = SpreadsheetApp.openById(spreadsheetID);
  var myControlCenterSheet = mySpreadsheet.getSheetByName("Control Center");

  if (mySpreadsheet.getId() === "1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8") {
    mySpreadsheet.toast("Sync operation not allowed on the template sheet!");
    console.log("Sync operation not allowed on the template sheet!");
    return;
  }

  if (myControlCenterSheet) {
    myControlCenterSheet.activate();
    mySpreadsheet.renameActiveSheet(`zzz${myControlCenterSheet.getName()}`);
    // mySpreadsheet.deleteSheet(myChangelogSheet);
  }

  var zzzControlCenterSheet = mySpreadsheet.getSheetByName("zzzControl Center");

  updatedControlCenterSheet.copyTo(mySpreadsheet).setName("Control Center").activate();
  mySpreadsheet.moveActiveSheet(zzzControlCenterSheet.getIndex() + 1);

  var newControlCenterSheet = mySpreadsheet.getSheetByName("Control Center");

  console.log(zzzControlCenterSheet);
  console.log(newControlCenterSheet);

  zzzControlCenterSheet.getRange("B2:B8").copyTo(newControlCenterSheet.getRange("B2:B8"), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
  zzzControlCenterSheet.getRange("B12:B16").copyTo(newControlCenterSheet.getRange("B12:B16"), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
  mySpreadsheet.deleteSheet(zzzControlCenterSheet);
  mySpreadsheet.setActiveSheet(mySpreadsheet.getSheetByName("To-Do"));

  if (Session.getActiveUser().getEmail() !== 'amrit.dash@axelerant.com') {
    mySpreadsheet.toast("Updated Control Center Sheet.");
  }

  console.log("Updates Synced.");
  PropertiesService.getDocumentProperties().setProperty("sheetVersion", 2);
}