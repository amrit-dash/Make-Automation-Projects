var scoreboardSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cricket Stats - Team Table");
var liveMatchSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cricket Stats - Live Match");
var fixturesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cricket Stats - Fixtures");

var cricbuzzMatchID;
var cricbuzzSeriesID = 7476; // ICC T20 WC 24
// 7476 - ICC T20 WC 24
// 7607 - IPL 24
// 6732 - ICC WC 23

var colorSet = ["#ffffff","#ffffcc","#ccff99","#e6ccff","#e6fff2","#ffe0cc","#ccf2ff"];

var apiKey1 = "API_KEY_HERE";
var apiKey2 = "API_KEY_HERE";
var apiKey3 = "API_KEY_HERE";
var apiKey4 = "API_KEY_HERE";

var primaryAPIKey = apiKey4;

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': primaryAPIKey,
    'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
  }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('🧩 Script Menu')
    .addItem('Update Scores and Points', 'controller1')
    .addItem('Get Prediction Results', 'updatePredictionResults')
    .addItem('Get Live Score of In Progress Match', 'inProgressMatchScore')
    .addItem('Get Match Score By ID', 'getMatchScoreByID')
    .addToUi();
}

function useFuse(data, userInput) {
  const options = {
    keys: ['seriesName'],
    includeScore: true,
    threshold: 0.85, // Adjust the threshold as per your requirement
  };

  const fuse = new Fuse(data, options);
  var result = fuse.search(userInput);
  return result.length > 0 ? result[0].item : null;
}

function getAPIdata(format) {
  var url;

  if (format.includes("board")) {
    url = `https://cricbuzz-cricket.p.rapidapi.com/stats/v1/series/${cricbuzzSeriesID}/points-table`;
  } else if (format.includes("fixture")) {
    url = `https://cricbuzz-cricket.p.rapidapi.com/series/v1/${cricbuzzSeriesID}`;
  } else if (format.includes("live") || format.includes("recent") || format.includes("upcoming")) {
    url = `https://cricbuzz-cricket.p.rapidapi.com/matches/v1/${format}`;
  } else if (format.includes("scoreByID")) {
    url = `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${cricbuzzMatchID}/scard`;
  } else {
    console.log("Wrong API call");
    return;
  }


  try {
    const response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());

    // console.log(data)

    return data;

  } catch (error) {
    console.error(error);
  }
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

function getLeaderboard() {
  scoreboardSheet.getRange("A2:Z").clearContent().setBackground('white');
  // try {
    var data = getAPIdata("board");
    var colorIndex = 0;

    // console.log(data)

    data.pointsTable.forEach(group => {
      var teams = group.pointsTableInfo;
      var range = scoreboardSheet.getRange(`A${getLastDataRow(scoreboardSheet) + 1}`);

      var groupRange = scoreboardSheet.getRange(`A${getLastDataRow(scoreboardSheet) + 1}:I${getLastDataRow(scoreboardSheet) + teams.length}`);

      data.pointsTable.length > 1 ? groupRange.setBackground(colorSet[++colorIndex]) : groupRange.setBackground(colorSet[colorIndex++]);

      teams.forEach((team, index) => {
        // console.log(team);
        // return;
        var rowData = [index + 1, team.teamFullName, team.matchesPlayed, team.matchesWon ? team.matchesWon : 0, team.matchesLost ? team.matchesLost : 0, team.matchesDrawn ? team.matchesDrawn : 0, `${team.nrr}`, team.points, team.form ? team.form.join(" ") : ""];
        range.offset(index, 0, 1, rowData.length).setValues([rowData]);
      });
    });

  // } catch (error) {
  //   console.log(error);
  // }
}

function getFixture() {
  try {
    var data = getAPIdata("fixture");
    var allMatches = data.matchDetails.filter(match => !match.adDetail).map(matchDetails => matchDetails.matchDetailsMap.match).flat();
    var range = fixturesSheet.getRange('A2');

    // console.log(data);
    // console.log(allMatches)

    allMatches.forEach((match, index) => {
      var matchDetails = match.matchInfo;
      var matchScore = match.matchScore;

      // console.log(match);
      // console.log(matchScore.team2Score.inngs1)

      var rowData = (matchDetails.state.toLowerCase().includes("progress")) ? [matchDetails.matchDesc, matchDetails.team1.teamName + " vs " + matchDetails.team2.teamName, `${matchDetails.venueInfo.ground}, ${matchDetails.venueInfo.city}`, matchDetails.state] : [matchDetails.matchDesc, matchDetails.team1.teamName + " vs " + matchDetails.team2.teamName, `${matchDetails.venueInfo.ground}, ${matchDetails.venueInfo.city}`, matchDetails.state, matchDetails.status];

      var rowData2 = (matchScore && matchScore.team2Score) ? [`${matchDetails.team1.teamSName} : ${matchScore.team1Score.inngs1.runs} - ${matchScore.team1Score.inngs1.wickets ? matchScore.team1Score.inngs1.wickets : 0} (${matchScore.team1Score.inngs1.overs})\n${matchDetails.team2.teamSName} : ${matchScore.team2Score.inngs1.runs} - ${matchScore.team2Score.inngs1.wickets ? matchScore.team2Score.inngs1.wickets : 0} (${matchScore.team2Score.inngs1.overs})`, matchDetails.matchId] : [, matchDetails.matchId]


      range.offset(index, 0, 1, rowData.length).setValues([rowData]);
      range.offset(index, 5, 1, rowData2.length).setValues([rowData2]);
    });
  } catch (error) {
    console.log(error);
  }
}

function getLiveScore() {
  var statusCell = liveMatchSheet.getRange("H2");
  var matchTypeCell = liveMatchSheet.getRange("H3");
  var seriesNameCell = liveMatchSheet.getRange("H4");
  // var cricbuzzMatchIDCell = liveMatchSheet.getRange("H5");

  var status = (statusCell.isBlank()) ? "live" : statusCell.getValue().toString();
  var matchType = (matchTypeCell.isBlank()) ? "All" : matchTypeCell.getValue().toString();

  try {
    var data = getAPIdata(status);
    var range = liveMatchSheet.getRange('A15');

    var liveSeries = data.typeMatches.filter(val => val.matchType === ((matchType.length > 0) && (matchType !== "All") ? matchType : val.matchType)).map(temp => temp.seriesMatches).flat().filter(match => !match.adDetail).map(detail => detail.seriesAdWrapper);

    if (liveSeries.length > 0) {
      if (seriesNameCell.isBlank()) {

      } else {
        var foundSeries = useFuse(liveSeries, seriesNameCell.getValue());

        foundSeries.matches.forEach((match, index) => {
          var info = match.matchInfo;
          var scores = (match.matchScore) ? match.matchScore : "No Scores";

          // console.log(info);
          // console.log(scores);
          var rowData = [[`${info.team1.teamSName} vs ${info.team2.teamSName}`, ""], [info.team1.teamName, "score"], [info.team2.teamName, "score"], ["", ""]];
          console.log(rowData)
          range.offset(rowData.length, 0, rowData.length, 2).setValues(rowData);
        })
      }
    } else {
      liveMatchSheet.getRange("G10").setValue(`There are currently no ${status} ${matchType} match going on!`)
    }
  } catch (error) {
    console.error(error);
  }
}

function resetAllSheets() {
  scoreboardSheet.getRange("A2:Z").clearContent().setBackground('white');
  fixturesSheet.getRange("A2:Z").clearContent().setBackground('white');
  console.log("All Sheets Cleared!");
}

function controller1() {
  getLeaderboard();
  getFixture();
  console.log("Leaderboard and Fixtures Updated");
}

function controller2() {
  inProgressMatchScore();
}

function controller3() {
  resetAllSheets();
  getLeaderboard();
  getFixture();
}

function test() {
  // Usage example
  const data = ["ICC world cup 2023 muchachos", "Hola", "ICC Mens World Cup"];
  const userInput = "ICC world cup 2023"; // Example user input

  const closestMatchUsingFuse = useFuse(data, userInput);
  console.log(closestMatchUsingFuse);
}

function updatePredictionResults() {
  try {
    const parameters = {
      "updateResults": true
    };

    var payload = JSON.stringify(parameters);

    const options = {
      method: 'POST',
      contentType: 'application/json', // Set content type to JSON
      payload: payload
    };

    var response = UrlFetchApp.fetch('https://hook.eu1.make.com/ca85a1i5rayf4ibwz3no25bebric3gb1', options);

  } catch (e) {
    console.log(e);
    return;
  }
}

function inProgressMatchScore() {
  primaryAPIKey = apiKey3;

  var lastDataRow = fixturesSheet.getLastRow();
  var fixtureSheetData = fixturesSheet.getRange(`A1:G${lastDataRow}`).getValues();

  // Testing:
  // var inProgressMatch = [fixtureSheetData[40],fixtureSheetData[41]];
  // var inProgressMatch = fixtureSheetData.filter(match => match[6] !== "");
  var inProgressMatch = fixtureSheetData.filter(match => match[3].includes("Progress") || match[4].includes("Progress"));
  // console.log(fixtureSheetData[50])

  if (inProgressMatch.length == 0) {
    console.log("Currently No Matches Are In Progress.");
    return;
  }

  inProgressMatch.forEach(match => {
    var inProgressMatchRowNumber = fixtureSheetData.indexOf(match) + 1;
    cricbuzzMatchID = match[6];

    try {
      var apiData = getAPIdata("scoreByID");
      var matchScores = apiData.scoreCard;
      var matchHeader = apiData.matchHeader;

      // console.log(matchScores)
      // console.log(matchHeader)

      if (matchHeader.state.includes("Complete") || matchHeader.state.includes("Progress") || matchHeader.state.includes("Break")) {
        var tossResult = `${matchHeader.tossResults.tossWinnerName} won the toss and choose to ${matchHeader.tossResults.decision.includes("Bat") ? "bat" : "bowl"}.`;

        if (matchScores.length == 1) {
          var formattedScore = `${matchScores[0].batTeamDetails.batTeamShortName} : ${matchScores[0].scoreDetails.runs} - ${matchScores[0].scoreDetails.wickets}  [Overs: ${matchScores[0].scoreDetails.overs}, Run Rate: ${matchScores[0].scoreDetails.runRate}]\n${matchScores[0].bowlTeamDetails.bowlTeamShortName} : Yet to bat`;
        } else {
          var formattedScore = `${matchScores[0].batTeamDetails.batTeamShortName} : ${matchScores[0].scoreDetails.runs} - ${matchScores[0].scoreDetails.wickets}  [Overs: ${matchScores[0].scoreDetails.overs}, Run Rate: ${matchScores[0].scoreDetails.runRate}]\n${matchScores[1].batTeamDetails.batTeamShortName} : ${matchScores[1].scoreDetails.runs} - ${matchScores[1].scoreDetails.wickets}  [Overs: ${matchScores[1].scoreDetails.overs}, Run Rate: ${matchScores[1].scoreDetails.runRate}]`;
        }

        var formattedResponse = `${matchHeader.team1.name} vs ${matchHeader.team2.name}\n\nToss: ${tossResult}\nMatch State: ${matchHeader.state}\n\nScores:\n${formattedScore}\n\n\nStatus: ${matchHeader.status}.${(matchHeader.complete && matchHeader.playersOfTheMatch.length > 0) ? `\n\nMan of the Match: ${matchHeader.playersOfTheMatch[0].fullName ? matchHeader.playersOfTheMatch[0].fullName : "Not Announced Yet"}` : ""}`;

      } else if (matchHeader.status.includes("abandoned")) {
        var formattedResponse = `${matchHeader.team1.name} vs ${matchHeader.team2.name}\n\nMatch: Cancelled\nMatch Status: ${matchHeader.status}`;

        var formattedScore = matchHeader.status;
      } else {
        var formattedResponse = `${matchHeader.team1.name} vs ${matchHeader.team2.name}\n\nMatch: Not Yet Started\nMatch Status: ${matchHeader.status}`;
      }

      fixturesSheet.getRange(`F${inProgressMatchRowNumber}`).setValue(formattedScore);
      fixturesSheet.getRange(`E${inProgressMatchRowNumber}`).setValue(formattedResponse);
      // console.log(formattedResponse);
    } catch (e) {
      console.log(e);
      return;
    }
  });

  console.log("Live Score Updated To The In Progress Match.");
}

function getMatchScoreByID() {
  primaryAPIKey = apiKey1;

  var ui = SpreadsheetApp.getUi(); // Same variations.
  var response = ui.prompt('Get Match Details By ID', 'Please Enter The CricBuzz Match ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() == ui.Button.OK) {
    cricbuzzMatchID = response.getResponseText();
    try {
      var apiData = getAPIdata("scoreByID");
      var matchScores = apiData.scoreCard;
      var matchHeader = apiData.matchHeader;

      // console.log(apiData)

      if (matchHeader.state.includes("Complete") || matchHeader.state.includes("Progress")) {
        var tossResult = `${matchHeader.tossResults.tossWinnerName} won the toss and choose to ${matchHeader.tossResults.decision.includes("Bat") ? "bat" : "bowl"}.`;

        if (matchScores.length == 1) {
          var formattedScore = `${matchScores[0].batTeamDetails.batTeamShortName} : ${matchScores[0].scoreDetails.runs} - ${matchScores[0].scoreDetails.wickets}  [Overs: ${matchScores[0].scoreDetails.overs}, Run Rate: ${matchScores[0].scoreDetails.runRate}]\n${matchScores[0].bowlTeamDetails.bowlTeamShortName} : Yet to bat`;
        } else {
          var formattedScore = `${matchScores[0].batTeamDetails.batTeamShortName} : ${matchScores[0].scoreDetails.runs} - ${matchScores[0].scoreDetails.wickets}  [Overs: ${matchScores[0].scoreDetails.overs}, Run Rate: ${matchScores[0].scoreDetails.runRate}]\n${matchScores[1].batTeamDetails.batTeamShortName} : ${matchScores[1].scoreDetails.runs} - ${matchScores[1].scoreDetails.wickets}  [Overs: ${matchScores[1].scoreDetails.overs}, Run Rate: ${matchScores[1].scoreDetails.runRate}]`;
        }

        var formattedResponse = `${matchHeader.team1.name} vs ${matchHeader.team2.name}\n\nToss: ${tossResult}\nMatch State: ${matchHeader.state}\n\nScores:\n${formattedScore}\n\n\nStatus: ${matchHeader.status}.${(matchHeader.complete && matchHeader.playersOfTheMatch.length > 0) ? `\n\nMan of the Match: ${matchHeader.playersOfTheMatch[0].fullName}` : ""}`;

      } else {
        var formattedResponse = `${matchHeader.team1.name} vs ${matchHeader.team2.name}\n\nMatch: Not Yet Started\nMatch Status: ${matchHeader.status}`;
      }

      ui.alert(`${matchHeader.seriesName} | ${matchHeader.team1.shortName} vs ${matchHeader.team2.shortName}`, formattedResponse, ui.ButtonSet.OK);
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  } else {
    Logger.log('The user didn\'t provide CricBuzz Match ID.');
    return;
  }
}
