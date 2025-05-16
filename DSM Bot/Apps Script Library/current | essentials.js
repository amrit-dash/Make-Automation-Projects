// No hardcoded sensitive data (API keys, tokens, emails) present in this file. Safe for publishing.
var todoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("To-Do");
var completedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Completed");
var blockersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blockers");
var updateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Status Update");
var slackIDsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("KEY Slack ID");
var archiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Archived Tasks");
var controlCenterSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Control Center");

var dndKey = controlCenterSheet ? controlCenterSheet.getRange("B12").isChecked() : false;
var doArchiveKey = controlCenterSheet ? controlCenterSheet.getRange("B13").isChecked() : false;
var slackHandleReplacementKey = controlCenterSheet ? controlCenterSheet.getRange("B14").isChecked() : false;
var textStyleKey = controlCenterSheet ? (controlCenterSheet.getRange("B15").isBlank() ? "BLOCKS" : controlCenterSheet.getRange("B15").getValue()) : "BLOCKS";
var delayReminderWeeks = controlCenterSheet ? (controlCenterSheet.getRange("B16").isBlank() ? 2 : parseInt(controlCenterSheet.getRange("B16").getValue())) : 2;
var doNotSendLeaveReminder = controlCenterSheet ? controlCenterSheet.getRange("B17").isChecked() : false;

function permissions() {
  console.log("Permissions Loaded!");
  SpreadsheetApp.getActiveSpreadsheet().toast("Permissions Loaded.", "Success");
  setup2();
  return;
}

function setup2() {
  var sheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
  var sheetProperty = PropertiesService.getScriptProperties().getProperty(sheetID);
  if (!sheetProperty) {
    var userEmail = Session.getActiveUser().getEmail();
    PropertiesService.getScriptProperties().setProperty(sheetID, userEmail);

    console.log("Added new sheet to library!");
  }

  var sheetVersion = PropertiesService.getDocumentProperties().getProperty("sheetVersion");
  if (!sheetVersion) {

    var templateSpreadsheetSheetVersion = PropertiesService.getScriptProperties().getProperty("sheetVersion");
    PropertiesService.getDocumentProperties().setProperty("sheetVersion", parseInt(templateSpreadsheetSheetVersion));

    console.log("Sheet version loaded to sheet!");
  }

  var scriptVersion = PropertiesService.getDocumentProperties().getProperty("scriptVersion");
  if (!scriptVersion) {

    var templateSpreadsheetScriptVersion = PropertiesService.getScriptProperties().getProperty("scriptVersion");
    PropertiesService.getDocumentProperties().setProperty("scriptVersion", parseInt(templateSpreadsheetScriptVersion));

    console.log("Script version loaded to sheet!");
  }
}

function initialTriggersSetup() {
  permissions();

  //Check for Time Value
  if (controlCenterSheet.getRange("B8").isBlank()) {
    console.log("Time is not set up for auto sending DSM updates. Asking in prompt.");
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt("Please enter the time when you'd want the DSM bot to sent automatic daily updates.\n(Time format in HH:MM 24Hrs)");
    if (response.getSelectedButton() == ui.Button.OK) {
      controlCenterSheet.getRange("B8").setValue(response.getResponseText());
      controlCenterSheet.getRange("B8").activate();
      initialTriggersSetup();
      return;
    } else {
      console.log('The user clicked the close button in the dialog\'s title bar.');
      SpreadsheetApp.getActiveSpreadsheet().toast("Please perform the initial setup again!", "Failed")
      return;
    }
  }

  var existingTriggers = ScriptApp.getProjectTriggers();
  var dailyTrigger = existingTriggers.find(trigger => trigger.getHandlerFunction() === 'dailyTiggersSetup');

  if (dailyTrigger) {
    PropertiesService.getDocumentProperties().setProperty('initialSetup', 'Daily Trigger Running at ~ 01:11.');
    console.log("Trigger Exists For Handler: dailyTiggersSetup()");
  } else {
    ScriptApp.newTrigger('dailyTiggersSetup')
      .timeBased()
      .atHour(1)
      .nearMinute(11)
      .everyDays(1)
      .create();

    ScriptApp.newTrigger('hideArchivedTasks')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(0)
      .create();

    ScriptApp.newTrigger('checkPendingTasks')
      .timeBased()
      .atHour(1)
      .nearMinute(30)
      .everyDays(1)
      .create();

    PropertiesService.getDocumentProperties().setProperty('initialSetup', 'Daily Trigger Running at ~ 01:11.');
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("Initial setup completed.\nScript triggers installed.", "Success")
}

function dailyTiggersSetup() {
  //Check for Time Value
  if (controlCenterSheet.getRange("B8").isBlank()) {
    console.log("Time is not set up for auto sending DSM updates.");
    return;
  }

  var timeToSend = controlCenterSheet.getRange("B8").getValue();
  var existingTriggers = ScriptApp.getProjectTriggers();

  existingTriggers
    .filter(trigger => trigger.getHandlerFunction() === 'sendUpdateToChannel')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  existingTriggers
    .filter(trigger => trigger.getHandlerFunction() === 'statusUpdate')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  existingTriggers
    .filter(trigger => trigger.getHandlerFunction() === 'newDay')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  var sendUpdateTriggerTime = new Date().setHours(timeToSend.getHours(), timeToSend.getMinutes());
  var newDayTriggerTime = sendUpdateTriggerTime - (2 * 60 * 60 * 1000);
  var statusUpdateTriggerTime = sendUpdateTriggerTime - (1 * 60 * 60 * 1000);

  // Create a trigger to call 'sendUpdateToChannel' at the specified time on the target day
  ScriptApp.newTrigger('sendUpdateToChannel')
    .timeBased()
    .at(new Date(sendUpdateTriggerTime))
    .create();

  // Create a trigger to call 'newDay' 2 hours before 'sendUpdateToChannel' on the target day
  ScriptApp.newTrigger('newDay')
    .timeBased()
    .at(new Date(newDayTriggerTime))
    .create();

  // Create a trigger to call 'statusUpdate' 1 hours before 'sendUpdateToChannel' on the target day
  ScriptApp.newTrigger('statusUpdate')
    .timeBased()
    .at(new Date(statusUpdateTriggerTime))
    .create();
}

function sendUpdateToChannel() {
  //Check for DND
  if (dndKey) {
    console.log("DND is on!");
    return;
  }

  //Check for Weekend
  var today = new Date().getDay();
  if (today == 6 || today == 0) {
    console.log("Today is a weekend!");
    return;
  }

  var testing = controlCenterSheet.getRange("B2").isChecked();
  var testingChannelID = controlCenterSheet.getRange("B3").getValue();
  var dsmChannelID = controlCenterSheet.getRange("B4").getValue();
  var searchQuery = controlCenterSheet.getRange("B7").getValue();

  var spreadsheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
  var userEmail = Session.getActiveUser().getEmail();

  const parameters = {
    "testing": testing,
    "testingChannelID": testingChannelID,
    "dsmChannelID": dsmChannelID,
    "searchQuery": searchQuery,
    "spreadsheetID": spreadsheetID,
    "userEmail": userEmail,
    "textStyle": textStyleKey,
    "doNotSendLeaveNotification": doNotSendLeaveReminder
  };

  var payload = JSON.stringify(parameters);

  const options = {
    method: 'POST',
    contentType: 'application/json', // Set content type to JSON
    payload: payload
  };

  try {
    statusUpdate();
    Utilities.sleep(4000);
  } catch (e) {
    console.log("Could not update latest status.");
    console.log(e);
  }

  try {
    var response = UrlFetchApp.fetch('https://hook.eu1.make.com/6ds4e5lm3ag3b3e9nnx7km9l3fm8pe3y', options);

    if (!testing && response.getContentText().includes("DSM Update Sent")) {
      updateSent();
    }
  } catch (e) {
    console.log("Could Not Send Update Due to " + e);
  }
}

function updateSent() {
  var lastRow = completedSheet.getLastRow();
  var range = completedSheet.getRange(2, 1, lastRow - 1, 3); // Assuming data starts from row 2 and includes columns A, B, and C

  var values = range.getValues();
  var outputValues = [];

  for (var i = 0; i < values.length; i++) {
    var status = values[i][2]; // Assuming column C contains the status

    if (status === "COMPLETED") {
      outputValues.push(["SENT"]);
    } else {
      outputValues.push([""]);
    }
  }

  completedSheet.getRange(2, 4, outputValues.length, 1).setValues(outputValues);
  console.log("Updated Sent Tasks!");
}

function newDay() {
  var today = new Date().getDay();
  if (today == 6 || today == 0) {
    console.log("Today is a weekend!");
    return;
  }
  if (dndKey) {
    console.log("DND is on!");
    return;
  }


  var lastCompletedSheetRow = getLastDataRow(completedSheet);
  var tasksToArchive = [];

  for (let i = 2; i <= lastCompletedSheetRow; i++) {
    if ((completedSheet.getRange(`C${i}`).getValue() === "COMPLETED") && (completedSheet.getRange(`D${i}`).getValue() === "SENT")) {
      if (doArchiveKey) {
        tasksToArchive.push({
          task: completedSheet.getRange(`A${i}`).getValue(),
          link: completedSheet.getRange(`B${i}`).getValue(),
          status: completedSheet.getRange(`C${i}`).getValue()
        });
      }
      completedSheet.deleteRow(i);
      i--;
    }
  }
  if (tasksToArchive.length > 0) {
    archiveTasks(tasksToArchive);
  }


  completedSheet.getRange(`D2:D`).clearContent();
  statusUpdate();
}

function statusUpdate() {
  var lastRow = getLastDataRow(completedSheet);
  var blockersLastRow = getLastDataRow(blockersSheet);

  var completedTasksArray = [], inProgressTasksArray = [], blockersInTaskArray = [];

  for (let i = 2; i <= lastRow; i++) {
    var statusCRange = completedSheet.getRange(`C${i}`);
    var statusDRange = completedSheet.getRange(`D${i}`);

    if (statusCRange.getValue() === "COMPLETED" && statusDRange.getValue() !== "SENT") {
      completedTasksArray.push(
        `• ${completedSheet.getRange(`A${i}`).getValue()}\n` +
        (completedSheet.getRange(`B${i}`).isBlank() ? '' : `${completedSheet.getRange(`B${i}`).getValue()}\n`)
      );
    } else if (statusCRange.isChecked()) {
      inProgressTasksArray.push(
        `• ${completedSheet.getRange(`A${i}`).getValue()}\n` +
        (completedSheet.getRange(`B${i}`).isBlank() ? '' : `${completedSheet.getRange(`B${i}`).getValue()}\n`)
      );
    }
  }

  if (blockersSheet.getRange(`D${blockersLastRow}`).isBlank() || !blockersSheet.getRange(`D${blockersLastRow}`).isChecked()) {
    var lastUpdatedRow = getLastDataRow(blockersSheet, "D") + 1;

    for (let i = lastUpdatedRow; i <= blockersLastRow; i++) {
      blockersInTaskArray.push(
        `• Blockers w.r.t. ${blockersSheet.getRange(`A${i}`).getValue()}:\n--\n${blockersSheet.getRange(`C${i}`).getValue()}\n`
      );
    }
  }

  var salutationText = getSalutationText();

  var dateOptions = { day: 'numeric', month: 'short' };
  var today = new Date();
  const formattedDate = today.toLocaleString("en-US", dateOptions);

  var completedTasks = completedTasksArray.join('\n') || '• None';
  var inProgressTasks = inProgressTasksArray.join('\n') || '• None';
  var blockersInTask = blockersInTaskArray.join('\n') || '• None';

  if (slackHandleReplacementKey) {
    completedTasks = completedTasks.slackChecker();
    inProgressTasks = inProgressTasks.slackChecker();
    blockersInTask = blockersInTask.slackChecker();
  }

  var text = `${salutationText}\n*Here's the effort recap for ${formattedDate}.*\n\n\n*Recent Accomplishment:*\n\`\`\`${completedTasks}\`\`\`\n\n*Currently Working On:*\n\`\`\`${inProgressTasks}\`\`\`\n\n*Blockers:*\n\`\`\`${blockersInTask}\`\`\``;

  updateSheet.getRange("A30").setValue(salutationText);
  updateSheet.getRange("A31").setValue(completedTasks);
  updateSheet.getRange("A32").setValue(inProgressTasks);
  updateSheet.getRange("A33").setValue(blockersInTask);
  updateSheet.getRange("A34").setValue(Date.now());
  updateSheet.getRange("A1").setValue(text);
}

function checkPendingTasks() {
  var lastRow = getLastDataRow(todoSheet, "G");
  var now = new Date(), timestamp;
  var checkDate = now.addDays(-7 * delayReminderWeeks);
  var checkDateTooLate = now.addDays(-7 * (2 + delayReminderWeeks));

  var colorCode, note;

  if (lastRow <= 1) {
    console.log("Only Header Row Exists. Won't check pending tasks!...");
    return;
  }

  for (let i = 2; i <= lastRow; i++) {
    timestamp = new Date(todoSheet.getRange(`G${i}`).getValue());

    if (isNaN(timestamp)) {
      continue;
    }

    if (timestamp < checkDate) {

      if (timestamp < checkDateTooLate) {
        colorCode = "#f4cccc";
        note = `This task has not been updated since the last ${delayReminderWeeks + 2} weeks.\n\nPlease consider marking it as "Ignored" to archive it.`;
      } else {
        colorCode = "#fff2cc";
        note = `This task has not been updated since the last ${delayReminderWeeks} weeks.\n\nPlease consider marking it as "Ignored" to archive it.`;
      }

    } else {
      colorCode = null;
      note = null;
    }

    todoSheet.getRange(`A${i}:F${i}`).setBackground(colorCode);
    todoSheet.getRange(`A${i}`).setNote(note);
  }
}

function resetAll() {
  completedSheet.getRange(`A2:D`).clearContent();
  completedSheet.getRange(`C2:C`).removeCheckboxes();
  blockersSheet.getRange(`A2:D`).clearContent();
  blockersSheet.getRange(`D2:D`).removeCheckboxes();
  todoSheet.getRange(`C2:F`).uncheck();
  statusUpdate();

  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(`Would you also want to delete all associated project triggers?`, ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    deleteAllTriggers();
  } else {
    console.log("Project triggers are intact!")
  }

  var lastToDoRow = getLastDataRow(todoSheet);
  if (lastToDoRow < 2) {
    console.log("No data in To-Do sheet to delete.");
    return;
  } else {
    var response2 = ui.alert(`Would you also want to delete all tasks in the To-Do sheet?`, ui.ButtonSet.YES_NO);
    if (response2 == ui.Button.YES) {
      todoSheet.deleteRows(2, lastToDoRow - 1);
    } else {
      console.log("Did not delete the To-Do tasks!");
    }
  }

  var lastArchivedRow = getLastDataRow(archiveSheet);
  if (lastArchivedRow < 2) {
    console.log("No data in Archived sheet to delete.");
    return;
  } else {
    var response3 = ui.alert(`Would you also want to delete the data in Archived sheet?`, ui.ButtonSet.YES_NO);
    if (response3 == ui.Button.YES) {
      archiveSheet.deleteRows(2, lastArchivedRow - 1);
    } else {
      console.log("Did not delete the Archived sheet data!")
      return;
    }
  }
}
