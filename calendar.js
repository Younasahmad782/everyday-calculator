(function () {
  var grid = document.getElementById("cal-grid");
  if (!grid) return;

  var monthLabel = document.getElementById("cal-month-label");
  var prevBtn = document.getElementById("cal-prev");
  var nextBtn = document.getElementById("cal-next");
  var todayBtn = document.getElementById("cal-today");

  var today = new Date();
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth(); // 0-indexed

  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function daysInMonth(year, month) {
    var lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return lengths[month];
  }

  function renderCalendar() {
    monthLabel.textContent = MONTH_NAMES[viewMonth] + " " + viewYear;
    grid.innerHTML = "";
    DOW_NAMES.forEach(function (d) {
      var el = document.createElement("div");
      el.className = "dow";
      el.textContent = d;
      grid.appendChild(el);
    });

    var firstDow = new Date(viewYear, viewMonth, 1).getDay();
    var totalDays = daysInMonth(viewYear, viewMonth);
    var prevMonthDays = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

    // leading days from previous month
    for (var i = firstDow - 1; i >= 0; i--) {
      var el1 = document.createElement("div");
      el1.className = "day muted";
      el1.textContent = prevMonthDays - i;
      grid.appendChild(el1);
    }

    for (var day = 1; day <= totalDays; day++) {
      var el2 = document.createElement("div");
      var isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      el2.className = "day" + (isToday ? " today" : "");
      el2.textContent = day;
      grid.appendChild(el2);
    }

    // trailing days to fill the last week
    var used = firstDow + totalDays;
    var trailing = (7 - (used % 7)) % 7;
    for (var t = 1; t <= trailing; t++) {
      var el3 = document.createElement("div");
      el3.className = "day muted";
      el3.textContent = t;
      grid.appendChild(el3);
    }
  }

  prevBtn.addEventListener("click", function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  nextBtn.addEventListener("click", function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  todayBtn.addEventListener("click", function () {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    renderCalendar();
  });

  renderCalendar();

  // --- Date difference calculator ---
  var diffStart = document.getElementById("diff-start");
  var diffEnd = document.getElementById("diff-end");
  var diffBtn = document.getElementById("diff-calc");
  var diffResult = document.getElementById("diff-result");

  function parseDateInput(input) {
    if (!input.value) return null;
    var parts = input.value.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function monthsYearsDaysBetween(a, b) {
    // a <= b
    var years = b.getFullYear() - a.getFullYear();
    var months = b.getMonth() - a.getMonth();
    var days = b.getDate() - a.getDate();
    if (days < 0) {
      months -= 1;
      var prevMonth = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years: years, months: months, days: days };
  }

  diffBtn.addEventListener("click", function () {
    var start = parseDateInput(diffStart);
    var end = parseDateInput(diffEnd);
    if (!start || !end) {
      diffResult.hidden = false;
      diffResult.className = "result-box error";
      diffResult.textContent = "Please choose both a start and an end date.";
      return;
    }
    var a = start <= end ? start : end;
    var b = start <= end ? end : start;
    var msPerDay = 86400000;
    var totalDays = Math.round((b - a) / msPerDay);
    var totalWeeks = Math.floor(totalDays / 7);
    var approxMonths = Math.round(totalDays / 30.44);
    var ymd = monthsYearsDaysBetween(a, b);

    diffResult.className = "result-box";
    diffResult.hidden = false;
    diffResult.innerHTML =
      '<div class="big">' + totalDays + " days</div>" +
      '<div class="row"><span>Total weeks</span><span>' + totalWeeks + "</span></div>" +
      '<div class="row"><span>Approximate months</span><span>' + approxMonths + "</span></div>" +
      '<div class="row"><span>Years, months and days</span><span>' + ymd.years + "y " + ymd.months + "m " + ymd.days + "d</span></div>";
  });

  // --- Add / subtract days ---
  var addDate = document.getElementById("add-date");
  var addDays = document.getElementById("add-days");
  var addOp = document.getElementById("add-op");
  var addBtn = document.getElementById("add-calc");
  var addResult = document.getElementById("add-result");

  addBtn.addEventListener("click", function () {
    var base = parseDateInput(addDate);
    var n = parseInt(addDays.value, 10);
    if (!base) {
      addResult.hidden = false;
      addResult.className = "result-box error";
      addResult.textContent = "Please choose a date.";
      return;
    }
    if (isNaN(n) || n < 0) {
      addResult.hidden = false;
      addResult.className = "result-box error";
      addResult.textContent = "Please enter a valid number of days.";
      return;
    }
    var result = new Date(base);
    result.setDate(result.getDate() + (addOp.value === "add" ? n : -n));
    var text = result.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

    addResult.className = "result-box";
    addResult.hidden = false;
    addResult.innerHTML = '<div class="big">' + text + "</div>";
  });

  // Default the date inputs to today for convenience
  var todayStr = today.toISOString().slice(0, 10);
  addDate.value = todayStr;
})();
