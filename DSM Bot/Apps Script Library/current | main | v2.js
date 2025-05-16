//Code Version
var ogSheetVersion = 2;
var ogScriptVersion = 3;

function onOpen() {
  var ui = SpreadsheetApp.getUi();

  var checkIntialSetup = PropertiesService.getDocumentProperties().getProperty('initialSetup');
  if (!checkIntialSetup) {
    ui.createMenu('⚙️ Setup Menu')
      .addItem('Check Script Permissions', 'permissions')
      .addItem('Setup Initial Triggers', 'initialTriggersSetup')
      .addToUi();
  }

  ui.createMenu('🗓️ Daily Menu')
    .addItem('Check Pending Tasks', 'checkPendingTasks')
    .addSeparator()
    .addItem('Update Status', 'statusUpdate')
    .addItem('Set-up Daily Trigger', 'dailyTiggersSetup')
    .addItem('Delete All Triggers', 'deleteAllTriggers')
    .addSeparator()
    .addSubMenu(ui.createMenu('Handle DSM Updates')
      .addItem('Send DSM Update in Slack', 'sendUpdateToChannel')
      .addItem('Mark Sent Updates', 'updateSent')
      .addItem('Clean Up Sent Updates', 'newDay'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Over-The-Top Features')
      .addItem('Hide Rows of Archived Tasks', 'hideArchivedTasks')
      .addItem('Show All Archived Tasks', 'showAllArchivedTasks'))
    .addToUi();

  ui.createMenu('🛠️ Beta Menu')
    .addItem('Sync Changelog Updates to Current Spreadsheet', 'syncChangelogUpdates')
    .addSeparator()
    .addItem('Check For Updates', 'test2')
    .addItem('Create Make Scenario : Archived', 'createMakeScenario')
    .addToUi();

  if (Session.getActiveUser().getEmail() === 'amrit.dash@axelerant.com') {
    ui.createMenu('🔐 Dev Menu')
      .addItem('Reset all Sheets', 'resetAll')
      .addSubMenu(ui.createMenu('Handle Triggers')
        .addItem('Setup Initial Triggers', 'initialTriggersSetup')
        .addItem('Delete All Triggers', 'deleteAllTriggers'))
      .addSubMenu(ui.createMenu('Updates Menu')
        .addSubMenu(ui.createMenu('Push Updates to Template Spreadsheet')
          .addItem('Sync Sheet Updates', 'admin_SyncSheetToTemplate')
          .addItem('Sync Script Updates', 'admin_SyncScriptToTemplate')
          .addSeparator()
          .addItem('Sync Changelog Updates to Template', 'admin_SyncChangelogUpdatesToTemplate'))
        .addSeparator()
        .addItem('Sync Template Version to Script Properties', 'admin_SetTemplateVersion'))
      .addSeparator()
      .addItem('Check Recurring Meetings', 'getRecurringMeetings')
      .addToUi();
  }

  checkPendingTasks();
  updateAvailableNotifier();
}

function onEdit(e) {
  const rangeNotation = e.range.getA1Notation();
  var startRow = e.range.getRow();
  var endRow = e.range.getLastRow();
  var sheetName = e.source.getSheetName();

  if (sheetName === "Blockers") {
    if (rangeNotation.includes("D") && e.range.isChecked() === true) {
      resolveBlocker(startRow, blockersSheet.getRange(`A${startRow}`).getValue())
    }
    statusUpdate();
    return;
  }

  if (sheetName !== "To-Do") {
    return;
  }

  if (rangeNotation.includes("C") && e.range.isChecked() === true) {
    completed(startRow, endRow);
  }

  if (rangeNotation.includes("D")) {
    if (e.range.isChecked() === true) {
      inProgress(startRow, endRow);
    } else if (e.range.isChecked() === false) {
      var searchVal = todoSheet.getRange(`A${startRow}`).getValue();
      var completedSheetRow = onSearch(completedSheet, searchVal, 1);
      completedSheet.deleteRow(completedSheetRow);
      statusUpdate();
    }
    todoSheet.getRange(`G${startRow}`).setValue(Date.now());
  }

  if (rangeNotation.includes("E") && e.range.isChecked() === true) {
    blockers(startRow, endRow);
  }

  if (rangeNotation.includes("F") && e.range.isChecked() === true) {

    var task = todoSheet.getRange(`A${startRow}`).getValue();

    if (progressCheckerBeforeDeletion(startRow, task, 1) === "NO") {
      e.range.setValue(false);
      return;
    }

    var tasksToArchive = [];

    tasksToArchive.push({
      task: todoSheet.getRange(`A${startRow}`).getValue(),
      link: todoSheet.getRange(`B${startRow}`).getValue(),
      status: "IGNORED"
    });

    archiveTasks(tasksToArchive);
    todoSheet.deleteRow(startRow);

  }

  if (rangeNotation.includes("A")) {
    if (e.range.isBlank()) {
      if (progressCheckerBeforeDeletion(startRow, e.oldValue) === "NO") {
        todoSheet.getRange(`A${startRow}`).setValue(e.oldValue);
        return;
      }
      todoSheet.deleteRow(startRow);
    } else if (e.oldValue) {
      completedSheetRow = onSearch(completedSheet, e.oldValue, 1);
      if (completedSheetRow) {
        var destination = completedSheet.getRange(`A${completedSheetRow}`);
        var source = todoSheet.getRange(`A${startRow}:B${endRow}`);
        source.copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
      }
    } else {
      todoSheet.getRange(`C${startRow}:F${endRow}`).insertCheckboxes();
      todoSheet.getRange(`G${startRow}`).setValue(Date.now());
    }
  }
  statusUpdate();
  checkPendingTasks();
}