// String.prototype.noneRemover = function () {
//   var text = this.toString();
//   if (text !== "• None") {
//     text = text.replaceAll('• None', '');
//   }

//   return text;
// }

// function zzzstatusUpdate() {
//   var lastRow = getLastDataRow(completedSheet);
//   var blockersLastRow = getLastDataRow(blockersSheet);

//   var completedTasks = '• None', inProgressTasks = '• None', blockersInTask = '• None';

//   for (let i = 2; i <= lastRow; i++) {
//     if ((completedSheet.getRange(`C${i}`).getValue() === "COMPLETED") && (completedSheet.getRange(`D${i}`).getValue() !== "SENT")) {

//       completedTasks += completedSheet.getRange(`B${i}`).isBlank() ? `• ${completedSheet.getRange(`A${i}`).getValue()}\n\n` : `• ${completedSheet.getRange(`A${i}`).getValue()}\n${completedSheet.getRange(`B${i}`).getValue()}\n\n`;
//     } else if (completedSheet.getRange(`C${i}`).isChecked()) {

//       inProgressTasks += completedSheet.getRange(`B${i}`).isBlank() ? `• ${completedSheet.getRange(`A${i}`).getValue()}\n\n` : `• ${completedSheet.getRange(`A${i}`).getValue()}\n${completedSheet.getRange(`B${i}`).getValue()}\n\n`;
//     }
//   }

//   // console.log(blockersSheet.getRange(`D${blockersLastRow}`).isBlank())

//   if (blockersSheet.getRange(`D${blockersLastRow}`).isBlank() || (blockersSheet.getRange(`D${blockersLastRow}`).isChecked() == false)) {
//     var lastUpdatedRow = getLastDataRow(blockersSheet, "D") + 1;

//     for (let i = lastUpdatedRow; i <= blockersLastRow; i++) {
//       blockersInTask += `• Blockers w.r.t. ${blockersSheet.getRange(`A${i}`).getValue()}:\n--\n${blockersSheet.getRange(`C${i}`).getValue()}\n\n`;

//     }
//   }

//   if (slackHandleReplacementKey) {
//     completedTasks = completedTasks.noneRemover().slackChecker().formatter();
//     inProgressTasks = inProgressTasks.noneRemover().slackChecker().formatter();
//     blockersInTask = blockersInTask.noneRemover().slackChecker().formatter();
//   } else {
//     completedTasks = completedTasks.noneRemover().formatter();
//     inProgressTasks = inProgressTasks.noneRemover().formatter();
//     blockersInTask = blockersInTask.noneRemover().formatter();
//   }

//   var salutationText = getSalutationText();

//   updateSheet.getRange("A30").setValue(salutationText);
//   updateSheet.getRange("A31").setValue(completedTasks);
//   updateSheet.getRange("A32").setValue(inProgressTasks);
//   updateSheet.getRange("A33").setValue(blockersInTask);
//   updateSheet.getRange("A34").setValue(Date.now());

//   var text = 'Hey team,\n' + salutationText + '\n*Please find below, my updates for the day.*\n\n\n*Recent Accomplishment:*\n```' + completedTasks + '```\n\n*Currently Working On:*\n```' + inProgressTasks + '```\n\n*Blockers:*\n```' + blockersInTask + '```';

//   if (slackHandleReplacementKey) {
//     updateSheet.getRange("A1").setValue(text.slackChecker());
//   } else {
//     updateSheet.getRange("A1").setValue(text);
//   }
// }

// function createMakeScenario() {

//   const paramaters = {
//     "spreadsheetID": SpreadsheetApp.getActiveSpreadsheet().getId(),
//     "testingChannelID": updateSheet.getRange("B40").getValue()
//   };

//   var encodeParameter = `?email=${Session.getActiveUser().getEmail()}`;

//   Object.keys(paramaters).forEach(param => {
//     encodeParameter += `&${param}=${paramaters[param]}`
//   })

//   const options = {
//     method: 'POST',
//     headers: {}
//   };

//   var response = UrlFetchApp.fetch(`https://hook.eu1.make.com/7tk6ybwfsfcjk591ut22gj7kc2shqajf${encodeParameter}`, options)

//   console.log(response.getContentText());
// }

// function syncChangelogUpdatesToTemplate_v1() {
//   var templateSpreadsheet = SpreadsheetApp.openById("1ZHeWLqPOmbwt-Lv9XAY3OMzuei7JqRR4YxJg0WAfxc8");
//   var changelogSheet = templateSpreadsheet.getSheetByName("Changelog");
//   var updatesSheet = SpreadsheetApp.openById("1bkVPB9WRVLRYud5R5ePv67VcJJ_nzi8pX6mNrPTb9dY").getSheetByName("Current Tool Updates");

//   if (changelogSheet) {
//     templateSpreadsheet.deleteSheet(changelogSheet);
//   }

//   updatesSheet.copyTo(templateSpreadsheet).setName("Changelog").activate();
//   // templateSpreadsheet.moveActiveSheet(1);

//   console.log("Updates Synced.");
//   SpreadsheetApp.getActiveSpreadsheet().toast("Synced Updates to Changelog in Template.");
// }