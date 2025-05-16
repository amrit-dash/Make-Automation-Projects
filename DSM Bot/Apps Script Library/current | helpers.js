Array.prototype.findIndex = function (search) {
  if (search == "") return false;
  for (var i = 0; i < this.length; i++)
    if (this[i] == search) return i;

  return -1;
}

String.prototype.slackChecker = function () {
  var text = this.toString();
  var slackIDData = slackIDsSheet.getRange(`A2:B`).getValues().filter(val => val[0] !== '' && val[1] !== '');
  var regex;

  slackIDData.forEach(id => {
    regex = new RegExp(id[0].toLowerCase(), 'gi');
    text = text.replaceAll(regex, `<@${id[1]}>`)
  });

  return text;
}

String.prototype.formatter = function () {
  var text = this.toString();
  text = text.replaceAll(`"`, `'`);
  return text;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getSalutationText() {
  // Get the current time
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  // Define the time ranges for greetings
  const morningStart = 5;
  const afternoonStart = 12;
  const eveningStart = 17;
  const nightStart = 20;

  // Determine the appropriate greeting
  if (currentHour >= morningStart && currentHour < afternoonStart) {
    return 'Good morning team! ☕️';
  } else if (currentHour >= afternoonStart && currentHour < eveningStart) {
    return 'Good afternoon team! ☀️';
  } else if (currentHour >= eveningStart && currentHour < nightStart) {
    return 'Good evening team! 🌇';
  } else {
    return 'Good night team! 🌒';
  }
}

function completed(startRow, endRow) {
  var lastRow = getLastDataRow(completedSheet) + 1;
  var destination = completedSheet.getRange(`A${lastRow}`);
  var task = todoSheet.getRange(`A${startRow}`).getValue();

  if (todoSheet.getRange(`D${startRow}`).isChecked()) {
    lastRow = onSearch(completedSheet, task, 1);
    completedSheet.getRange(`C${lastRow}`).removeCheckboxes().setValue("COMPLETED");
  } else {
    todoSheet.getRange(`A${startRow}:B${endRow}`).copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
    completedSheet.getRange(`C${lastRow}`).setValue("COMPLETED");
  }
  todoSheet.deleteRow(startRow);
  statusUpdate();
}

function inProgress(startRow, endRow) {
  var lastRow = getLastDataRow(completedSheet) + 1;
  var destination = completedSheet.getRange(`A${lastRow}`);
  var source = todoSheet.getRange(`A${startRow}:B${endRow}`);

  var control = onSearch(completedSheet, todoSheet.getRange(`A${startRow}`).getValue(), 1);

  if (control) {
    statusUpdate();
    return;
  }

  source.copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
  // completedSheet.activate();
  completedSheet.getRange(`C${lastRow}`).insertCheckboxes().check();
  statusUpdate();
}

function blockers(startRow, endRow) {
  var lastRow = getLastDataRow(blockersSheet) + 1;
  var destination = blockersSheet.getRange(`A${lastRow}`);
  var source = todoSheet.getRange(`A${startRow}:B${endRow}`);

  var control = onSearch(blockersSheet, todoSheet.getRange(`A${startRow}`).getValue(), 1);

  if (control) {
    blockersSheet.getRange(`C${control}`).activate();
    statusUpdate();
    return;
  }

  source.copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
  blockersSheet.getRange(`D${lastRow}`).insertCheckboxes();
  blockersSheet.getRange(`C${lastRow}`).activate();
  statusUpdate();
}

function onSearch(sheet, searchString, column) {

  var columnValues = sheet.getRange(2, column, sheet.getLastRow()).getValues(); //1st is header row
  var searchResult = columnValues.findIndex(searchString); //Row Index - 2

  if (searchResult != -1) {
    return (searchResult + 2);
    // SpreadsheetApp.getActiveSpreadsheet().setActiveRange(sheet.getRange(searchResult + 2, 1))
  }

  return;
}

function getLastDataRow(sheet, column = "A") {
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(column + lastRow);

  if (range.isBlank() || (range.isChecked() == false)) {
    return range.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
  } else {
    return lastRow;
  }
}

function resolveBlocker(row, blocker) {
  var todoSheetBlockerRowNumber = onSearch(todoSheet, blocker, 1);
  var todoSheetBlockerRow = todoSheet.getRange(`E${todoSheetBlockerRowNumber}`);

  todoSheetBlockerRow.uncheck();
  todoSheetBlockerRow.activate();

  var tasksToArchive = [];

  tasksToArchive.push({
    task: `${blocker}\n\n${blockersSheet.getRange(`C${row}`).getValue()}`,
    link: blockersSheet.getRange(`B${row}`).getValue(),
    status: "RESOLVED BLOCKER"
  });

  archiveTasks(tasksToArchive);
  blockersSheet.deleteRow(row);
}

function archiveTasks(tasksArray) {
  var lastRow = getLastDataRow(archiveSheet) + 1;

  tasksArray = tasksArray.map(val => {
    return [
      Utilities.formatDate(new Date(), "IST", "dd-MM-yyyy"),
      val.task,
      val.link,
      val.status
    ];
  });

  archiveSheet.getRange(`A${lastRow}:D${lastRow + tasksArray.length - 1}`).setValues(tasksArray);
}

function progressCheckerBeforeDeletion(row, task, isArchive = 0) {
  if ((todoSheet.getRange(`D${row}`).isChecked() || todoSheet.getRange(`E${row}`).isChecked()) && task) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(`The task: "${task}" is currently In Progress or with Blockers.\n\n${isArchive == 1?"Archive":"Delete"} it?`, ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      var completedSheetRow = onSearch(completedSheet, task, 1);
      var blockersSheetRow = onSearch(blockersSheet, task, 1);

      if (completedSheetRow) {
        completedSheet.deleteRow(completedSheetRow);
      }

      if (blockersSheetRow) {
        blockersSheet.deleteRow(blockersSheetRow);
      }

      console.log("User Override Completed!");
      return "YES";
    } else {
      return "NO";
    }
  }
}

function showAllArchivedTasks() {
  var dataRange = archiveSheet.getDataRange();
  archiveSheet.unhideRow(dataRange);
}

function hideArchivedTasks() {
  var dataRows = getLastDataRow(archiveSheet) - 1;
  archiveSheet.hideRows(2, dataRows);
}

function deleteAllTriggers() {
  var existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  PropertiesService.getDocumentProperties().deleteAllProperties();

  SpreadsheetApp.getActive().toast("All Project Triggers Deleted", "Reset Complete");

  console.log("Deleted all project triggers.");
  return;
}

function updateAvailableNotifier() {
  var sheetVersion = parseInt(PropertiesService.getDocumentProperties().getProperty("sheetVersion"));
  var scriptVersion = parseInt(PropertiesService.getDocumentProperties().getProperty("scriptVersion"));

  if (scriptVersion !== ogScriptVersion || sheetVersion !== ogSheetVersion) {
    if (scriptVersion !== ogScriptVersion && sheetVersion !== ogSheetVersion) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`New updates are available for Script and Sheet.\n\nInstall now by Checking for Updates in the Beta Menu!`, "Update Available!", 5);
    } else if (scriptVersion !== ogScriptVersion) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`New update available for Script${ogScriptVersion}.\n\nInstall now by Checking for Updates in the Beta Menu!`, "Update Available!", 5);
    } else if (sheetVersion !== ogSheetVersion) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`New update available for Sheet${ogSheetVersion}.\n\nInstall now by Checking for Updates in the Beta Menu!`, "Update Available!", 5);
    }
    return;
  }
}