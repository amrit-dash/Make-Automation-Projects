// var scoreboardSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cricket Stats - Team Table");
// var liveMatchSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cricket Stats - Live Match");
// var fixturesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cricket Stats - Fixtures");

// // const options = {
// //   method: 'GET',
// //   headers: {
// //     'X-RapidAPI-Key': 'f5042c3724mshdff77ba1bb874e7p1e0bd5jsne2396829e9e8',
// //     'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
// //   }
// // };

// function getAPIdata() {
//   // const url = 'https://livescore6.p.rapidapi.com/matches/v2/list-by-league?Category=cricket&Ccd=icc-mens-one-day-world-cup&Scd=2023-world-cup';

//   const url = 'https://cricbuzz-cricket.p.rapidapi.com/series/v1/6732';
//   const options = {
//     method: 'GET',
//     headers: {
//       'X-RapidAPI-Key': 'API_KEY_HERE',
//       'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
//     }
//   };

//   try {
//     const response = UrlFetchApp.fetch(url, options);
//     var data = JSON.parse(response.getContentText());

//     console.log(data)

//     return data;

//   } catch (error) {
//     console.error(error);
//   }
// }

// function getLeaderboard() {
//   try {
//     var data = getAPIdata();
//     var teams = data.Stages[0].LeagueTable.L[0].Tables[0].team;
//     var range = scoreboardSheet.getRange('A2');

//     teams.forEach((team, index) => {
//       // console.log(team);
//       var rowData = [team.rnk, team.Tnm, team.pld, team.winn, team.lstn, team.drwn, team.nrr, team.ptsn];
//       range.offset(index, 0, 1, rowData.length).setValues([rowData]);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }

// function getFixture() {
//   try {
//     var data = getAPIdata();
//     var match = data.Stages[0].Events;
//     var range = fixturesSheet.getRange('A2');

//     match.forEach((match, index) => {

//       const url = `https://livescore6.p.rapidapi.com/matches/v2/get-info?Category=cricket&Eid=${match.Eid}`;
//       const response = UrlFetchApp.fetch(url, options);
//       var data = JSON.parse(response.getContentText());

//       // console.log(data);

//       var rowData = (match.ECo.includes("at the toss")) ? [match.ErnInf, , `${data.Vnm}, ${data.Vcy}`, match.EpsL, match.ECo] : [match.ErnInf, match.T1[0].Nm + " vs " + match.T2[0].Nm, `${data.Vnm}, ${data.Vcy}`, match.EpsL, match.ECo, `${match.T1[0].Abr} : ${match.Tr1C1} - ${match.Tr1CW1} (${match.Tr1CO1})\n${match.T2[0].Abr} : ${match.Tr2C1} - ${match.Tr2CW1} (${match.Tr2CO1})`];
//       range.offset(index, 0, 1, rowData.length).setValues([rowData]);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }

// function getLiveScore() {
//   var status = "live";
//   var matchType = "All";
//   // var series = "icc world cup";

//   const url = `https://cricbuzz-cricket.p.rapidapi.com/matches/v1/${status}`;
//   const options1 = {
//     method: 'GET',
//     headers: {
//       'X-RapidAPI-Key': 'API_KEY_HERE',
//       'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
//     }
//   };


//   try {
//     const response = UrlFetchApp.fetch(url, options1);
//     var data = JSON.parse(response.getContentText());

//     var liveSeries = data.typeMatches.filter(val => val.matchType === ((matchType.length > 0) && (matchType !== "All") ? matchType : val.matchType)).map(temp => temp.seriesMatches);

//     var matches = liveSeries[0];

//     console.log(matches[0].seriesAdWrapper.matches);

//   } catch (error) {
//     console.error(error);
//   }
// }

// function resetAllSheets() {
//   scoreboardSheet.getRange("A2:Z").clearContent();
//   liveMatchSheet.getRange("B5:Z").clearContent();
//   fixturesSheet.getRange("A2:Z").clearContent();
//   console.log("All Sheets Cleared!");
// }

// function controller1() {
//   resetAllSheets();
//   getLeaderboard();
//   getFixture();
// }

// function controller2() {
//   resetAllSheets();
//   getLiveScore();
// }
