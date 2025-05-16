var recurringCalendarSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AUTO - Recurring Calender");

function getRecurringMeetings() {
  var now = new Date();
  var ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
  var calenderEvents = CalendarApp.getDefaultCalendar().getEvents(now, ninetyDaysFromNow);
  var recEvent = {}, recurringEventsID = [];

  calenderEvents.forEach((event) => {
    if (event.isRecurringEvent() && event.getGuestList().length > 1 && event.getMyStatus().toString() === "YES") {
      var title = event.getTitle();
      var id = event.getEventSeries().getId();

      if (!recurringEventsID.includes(id)) {
        recEvent = {
          id: event.getEventSeries().getId(),
          title: event.getTitle(),
          count: 0
        };
      } else {

      }

      console.log(recEvent);
      // console.log();
    }
  })
  // console.log(calenderEvents)
}

function getRecurringEvents() {
  // Replace with your Calendar ID.
  var calendarId = 'amrit.dash@axelerant.com'; // You can find this in the Calendar settings.

  // Calculate the date range for the next 90 days.
  var today = new Date();
  var ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(today.getDate() + 90);

  // Get the events from the calendar using the CalendarApp service.
  var calendar = CalendarApp.getCalendarById(calendarId);
  var events = calendar.getEvents(today, ninetyDaysLater);

  // Create an object to store event counts by day of the week.
  var dayOfWeekCounts = {};
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Iterate through the events.
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    
    // Get the day of the week for the event's start time.
    var eventDayOfWeek = Utilities.formatDate(event.getStartTime(), calendar.getTimeZone(), 'EEEE');

    // Count the occurrence for the day of the week.
    dayOfWeekCounts[eventDayOfWeek] = (dayOfWeekCounts[eventDayOfWeek] || 0) + 1;
  }

  // Log the event counts by day of the week.
  for (var k = 0; k < daysOfWeek.length; k++) {
    var day = daysOfWeek[k];
    var count = dayOfWeekCounts[day] || 0;
    Logger.log(day + ': ' + count);
  }
}


function testgetRecurringEvents() {
  // Replace with your Calendar ID.
  var calendarId = 'amrit.dash@axelerant.com'; // You can find this in the Calendar settings.

  // Calculate the date range for the next 90 days.
  var today = new Date();
  var ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(today.getDate() + 90);

  // Get the events from the calendar using the CalendarApp service.
  var calendar = CalendarApp.getCalendarById(calendarId);
  var events = calendar.getEvents(today, ninetyDaysLater);

  // Create an object to store event counts by day of the week.
  var dayOfWeekCounts = {};
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Iterate through the events.
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    
    // Get the day of the week for the event.
    var eventDayOfWeek = daysOfWeek[event.getDay()];

    // Count the occurrence for the day of the week.
    dayOfWeekCounts[eventDayOfWeek] = (dayOfWeekCounts[eventDayOfWeek] || 0) + 1;
  }

  // Log the event counts by day of the week.
  for (var k = 0; k < daysOfWeek.length; k++) {
    var day = daysOfWeek[k];
    var count = dayOfWeekCounts[day] || 0;
    Logger.log(day + ': ' + count);
  }
}


function zzzgetRecurringEvents() {
  // Replace with your Calendar ID.
  var calendarId = 'amrit.dash@axelerant.com'; // You can find this in the Calendar settings.
  
  // Calculate the date range for the next 90 days.
  var today = new Date();
  var ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(today.getDate() + 90);
  
  // Get the events from the calendar using the Advanced Calendar Service.
  var events = Calendar.Events.list(calendarId, {
    timeMin: today.toISOString(),
    timeMax: ninetyDaysLater.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  }).items;
  
  // Create an object to store event counts by day of the week.
  var dayOfWeekCounts = {};
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Iterate through the events.
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    
    // Check if the event is recurring.
    if (event.recurrence) {
      // Iterate through the recurring event rules.
      console.log(event.recurrence)
      for (var j = 0; j < event.recurrence.length; j++) {
        var recurrenceRule = event.recurrence[j];
        
        // Extract the day of the week from the recurrence rule.
        var dayOfWeek = recurrenceRule.match(/BYDAY=([A-Z]+)/i);
        if (dayOfWeek && dayOfWeek[1]) {
          // Count the occurrence for the day of the week.
          dayOfWeekCounts[dayOfWeek[1]] = (dayOfWeekCounts[dayOfWeek[1]] || 0) + 1;
        }
      }
    }
  }
  
  // Log the event counts by day of the week.
  for (var k = 0; k < daysOfWeek.length; k++) {
    var day = daysOfWeek[k];
    var count = dayOfWeekCounts[day] || 0;
    Logger.log(day + ': ' + count);
  }
}