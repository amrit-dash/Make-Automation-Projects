//Set template version
function admin_admin_SetTemplateVersion(sheetVersion = true, scriptVersion = true, autoUpdate = false) {

  if (Session.getActiveUser().getEmail() === 'amrit.dash@axelerant.com' || autoUpdate) {

    if (sheetVersion) {
      PropertiesService.getScriptProperties().setProperty("sheetVersion", isFinite(sheetVersion) ? sheetVersion : ogSheetVersion);
    }

    if (scriptVersion) {
      PropertiesService.getScriptProperties().setProperty("scriptVersion", isFinite(scriptVersion) ? scriptVersion : ogScriptVersion);
    }

    console.log("Updated Versions to Script Properties...");
  }
}

function admin_SyncChangelogUpdatesToTemplate() {
  var templateSpreadsheet = SpreadsheetApp.openById("1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8");
  var changelogSheet = templateSpreadsheet.getSheetByName("Changelog");
  var updatesSheet = SpreadsheetApp.openById("1bkVPB9WRVLRYud5R5ePv67VcJJ_nzi8pX6mNrPTb9dY").getSheetByName("Current Tool Updates");

  if (changelogSheet) {
    templateSpreadsheet.deleteSheet(changelogSheet);
  }

  updatesSheet.copyTo(templateSpreadsheet).setName("Changelog").activate();
  // templateSpreadsheet.moveActiveSheet(1);

  //Update changelog of users
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert("Sync update to the changelog in all user sheets?", ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    var userSheets = PropertiesService.getScriptProperties().getKeys().filter(key => key !== "1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8").filter(key => key !== "1bkVPB9WRVLRYud5R5ePv67VcJJ_nzi8pX6mNrPTb9dY").filter(key => key !== "scriptVersion").filter(key => key !== "sheetVersion");

    var count = 0;

    userSheets.forEach(sheetId => {
      try {
        syncChangelogUpdates(sheetId);
        count++;
        console.log("Updated sheet: " + sheetId);
      } catch (e) {
        console.log(`Problem with ${sheetId}.\n\n${e}`);
      }
    })
    SpreadsheetApp.getActiveSpreadsheet().toast(`Synced Updates to Changelog in ${count} spreadsheets.`, "Done", 3);
  } else {
    console.info("Did not update any associated spreadsheets.")
  }

  console.log("Updates Synced.");
  SpreadsheetApp.getActiveSpreadsheet().toast("Synced Updates to Changelog in Template.","Success", 6);
}

function admin_SyncScriptToTemplate() {
  updateToNewScript("1UYxaicpe0ICA2XUND2JwLTMxYd9GhHBU8OoKDaT-WIESYohzcM0-7Vng");
}

function admin_SyncSheetToTemplate() {
  var amritsSheet = SpreadsheetApp.openById("1bkVPB9WRVLRYud5R5ePv67VcJJ_nzi8pX6mNrPTb9dY");
  var templateSheet = SpreadsheetApp.openById("1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8");

  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Template Update Menu", "Enter the name of the sheet that you'd want to update to template. (case sensitive)", ui.ButtonSet.OK);

  if (response.getSelectedButton() == ui.Button.OK) {
    var sheetName = response.getResponseText();
    console.log(`Sheet to be updated: ${sheetName}`);

    var updatedSheet = amritsSheet.getSheetByName(sheetName);
    if (updatedSheet) {
      var toUpdateSheetTemplate = templateSheet.getSheetByName(sheetName);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast("No sheet found with the provided Sheet Name.", "Failed");
      return;
    }
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast("No sheet found with the provided Sheet Name.", "Failed");
    return;
  }

  if (toUpdateSheetTemplate) {
    templateSheet.deleteSheet(toUpdateSheetTemplate);
  }

  updatedSheet.copyTo(templateSheet).setName(sheetName).activate();

  if (sheetName.includes("Control")) {
    var newTemplateSheet = templateSheet.getSheetByName(sheetName);
    newTemplateSheet.getRange("B2").check();
    newTemplateSheet.getRange("B13").check();
    newTemplateSheet.getRange("B14").check();
  }

  var response2 = ui.alert("Update Version", `Update the Template Sheet Version to v${ogSheetVersion}`, ui.ButtonSet.YES_NO);

  if (response2 == ui.Button.NO) {
    var response3 = ui.prompt("Enter the new Template Sheet version.");

    if (response3.getSelectedButton() == ui.Button.OK) {
      var newVersion = parseInt(response.getResponseText());
      if (isFinite(newVersion)) {
        admin_SetTemplateVersion(newVersion, false, true);
        SpreadsheetApp.getActiveSpreadsheet().toast(`Synced template sheet version to v${newVersion}`, "Success", 2);
      } else {
        admin_SetTemplateVersion(true, false, true);
        SpreadsheetApp.getActiveSpreadsheet().toast(`Synced template sheet version to v${ogSheetVersion}`, "Warning", 2);
      }

    } else {
      console.log('The user clicked the close button in the dialog\'s title bar.');
      admin_SetTemplateVersion(true, false, true);
      SpreadsheetApp.getActiveSpreadsheet().toast(`Synced template sheet version to v${ogSheetVersion}`, "Warning", 2);
    }

  } else {
    admin_SetTemplateVersion(true, false, true);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Synced template sheet version to v${ogSheetVersion}`, "Warning", 2);
  }

  console.log("Updates Synced.");
  SpreadsheetApp.getActiveSpreadsheet().toast(`Synced Updates to ${sheetName} sheet in template spreadsheet.`, "Success", 4);
}

