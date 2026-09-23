(function () {
  function num(el) {
    var v = parseFloat(el.value);
    return isNaN(v) ? null : v;
  }
  function showBox(el, html, isError) {
    el.hidden = false;
    el.className = "result-box" + (isError ? " error" : "");
    el.innerHTML = isError ? html : html;
  }
  function fmt(n, decimals) {
    if (decimals === undefined) decimals = 2;
    return (Math.round((n + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals });
  }

  // --- Percentage: X% of Y ---
  var pc1x = document.getElementById("pc1-x"), pc1y = document.getElementById("pc1-y"), pc1r = document.getElementById("pc1-result");
  function calcPc1() {
    var x = num(pc1x), y = num(pc1y);
    if (x === null || y === null) { showBox(pc1r, "Please enter valid numbers.", true); return; }
    showBox(pc1r, '<div class="big">' + fmt(x / 100 * y) + "</div>");
  }
  [pc1x, pc1y].forEach(function (el) { el.addEventListener("input", calcPc1); });

  // --- Percentage: X is what % of Y ---
  var pc2x = document.getElementById("pc2-x"), pc2y = document.getElementById("pc2-y"), pc2r = document.getElementById("pc2-result");
  function calcPc2() {
    var x = num(pc2x), y = num(pc2y);
    if (x === null || y === null || y === 0) { showBox(pc2r, "Please enter valid numbers (Y cannot be 0).", true); return; }
    showBox(pc2r, '<div class="big">' + fmt(x / y * 100) + "%</div>");
  }
  [pc2x, pc2y].forEach(function (el) { el.addEventListener("input", calcPc2); });

  // --- Percentage change ---
  var pc3x = document.getElementById("pc3-x"), pc3y = document.getElementById("pc3-y"), pc3r = document.getElementById("pc3-result");
  function calcPc3() {
    var x = num(pc3x), y = num(pc3y);
    if (x === null || y === null || x === 0) { showBox(pc3r, "Please enter valid numbers (X cannot be 0).", true); return; }
    var change = (y - x) / Math.abs(x) * 100;
    var label = change >= 0 ? "Increase" : "Decrease";
    showBox(pc3r, '<div class="big">' + label + ": " + fmt(Math.abs(change)) + "%</div>");
  }
  [pc3x, pc3y].forEach(function (el) { el.addEventListener("input", calcPc3); });

  calcPc1(); calcPc2(); calcPc3();

  // --- Age calculator ---
  var ageDob = document.getElementById("age-dob"), ageAsOf = document.getElementById("age-asof"), ageBtn = document.getElementById("age-calc"), ageResult = document.getElementById("age-result");
  var today = new Date();
  ageAsOf.value = today.toISOString().slice(0, 10);

  function parseDate(input) {
    if (!input.value) return null;
    var p = input.value.split("-");
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }

  ageBtn.addEventListener("click", function () {
    var dob = parseDate(ageDob), asOf = parseDate(ageAsOf);
    if (!dob || !asOf) { showBox(ageResult, "Please choose a date of birth and a comparison date.", true); return; }
    if (dob > asOf) { showBox(ageResult, "Date of birth must be before the comparison date.", true); return; }

    var years = asOf.getFullYear() - dob.getFullYear();
    var months = asOf.getMonth() - dob.getMonth();
    var days = asOf.getDate() - dob.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
    }
    if (months < 0) { years -= 1; months += 12; }
    var totalDays = Math.round((asOf - dob) / 86400000);

    showBox(ageResult,
      '<div class="big">' + years + " years, " + months + " months, " + days + " days</div>" +
      '<div class="row"><span>Total days</span><span>' + totalDays.toLocaleString() + "</span></div>");
  });

  // --- BMI ---
  var bmiHeight = document.getElementById("bmi-height"), bmiWeight = document.getElementById("bmi-weight"), bmiBtn = document.getElementById("bmi-calc"), bmiResult = document.getElementById("bmi-result");
  bmiBtn.addEventListener("click", function () {
    var h = num(bmiHeight), w = num(bmiWeight);
    if (h === null || w === null || h <= 0 || w <= 0) { showBox(bmiResult, "Please enter a valid height and weight.", true); return; }
    var meters = h / 100;
    var bmi = w / (meters * meters);
    var category;
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    showBox(bmiResult, '<div class="big">' + fmt(bmi, 1) + "</div><div class=\"row\"><span>Category</span><span>" + category + "</span></div>");
  });

  // --- Average ---
  var avgInput = document.getElementById("avg-numbers"), avgBtn = document.getElementById("avg-calc"), avgResult = document.getElementById("avg-result");
  avgBtn.addEventListener("click", function () {
    var parts = avgInput.value.split(/[,\s]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var nums = parts.map(function (p) { return parseFloat(p); });
    if (nums.length === 0 || nums.some(isNaN)) { showBox(avgResult, "Please enter a list of valid numbers.", true); return; }
    var sum = nums.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / nums.length;
    showBox(avgResult,
      '<div class="big">Mean: ' + fmt(mean) + "</div>" +
      '<div class="row"><span>Sum</span><span>' + fmt(sum) + "</span></div>" +
      '<div class="row"><span>Count</span><span>' + nums.length + "</span></div>" +
      '<div class="row"><span>Minimum</span><span>' + fmt(Math.min.apply(null, nums)) + "</span></div>" +
      '<div class="row"><span>Maximum</span><span>' + fmt(Math.max.apply(null, nums)) + "</span></div>");
  });

  // --- Discount ---
  var discPrice = document.getElementById("disc-price"), discPct = document.getElementById("disc-pct"), discResult = document.getElementById("disc-result");
  function calcDisc() {
    var price = num(discPrice), pct = num(discPct);
    if (price === null || pct === null) { showBox(discResult, "Please enter valid numbers.", true); return; }
    var amount = price * (pct / 100);
    showBox(discResult,
      '<div class="big">Final price: ' + fmt(price - amount) + "</div>" +
      '<div class="row"><span>Discount amount</span><span>' + fmt(amount) + "</span></div>");
  }
  [discPrice, discPct].forEach(function (el) { el.addEventListener("input", calcDisc); });
  calcDisc();

  // --- Tip ---
  var tipBill = document.getElementById("tip-bill"), tipPct = document.getElementById("tip-pct"), tipPeople = document.getElementById("tip-people"), tipResult = document.getElementById("tip-result");
  function calcTip() {
    var bill = num(tipBill), pct = num(tipPct), people = num(tipPeople);
    if (bill === null || pct === null || people === null || people <= 0) { showBox(tipResult, "Please enter valid numbers.", true); return; }
    var tipAmount = bill * (pct / 100);
    var total = bill + tipAmount;
    showBox(tipResult,
      '<div class="big">Total: ' + fmt(total) + "</div>" +
      '<div class="row"><span>Tip amount</span><span>' + fmt(tipAmount) + "</span></div>" +
      '<div class="row"><span>Per person</span><span>' + fmt(total / people) + "</span></div>");
  }
  [tipBill, tipPct, tipPeople].forEach(function (el) { el.addEventListener("input", calcTip); });
  calcTip();

  // --- Loan / EMI ---
  var loanAmount = document.getElementById("loan-amount"), loanRate = document.getElementById("loan-rate"), loanYears = document.getElementById("loan-years"), loanResult = document.getElementById("loan-result");
  function calcLoan() {
    var p = num(loanAmount), annualRate = num(loanRate), years = num(loanYears);
    if (p === null || annualRate === null || years === null || p <= 0 || years <= 0) { showBox(loanResult, "Please enter valid numbers.", true); return; }
    var n = years * 12;
    var monthly;
    if (annualRate === 0) {
      monthly = p / n;
    } else {
      var r = annualRate / 100 / 12;
      monthly = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }
    var totalPayment = monthly * n;
    var totalInterest = totalPayment - p;
    showBox(loanResult,
      '<div class="big">Monthly payment: ' + fmt(monthly) + "</div>" +
      '<div class="row"><span>Total payment</span><span>' + fmt(totalPayment) + "</span></div>" +
      '<div class="row"><span>Total interest</span><span>' + fmt(totalInterest) + "</span></div>");
  }
  [loanAmount, loanRate, loanYears].forEach(function (el) { el.addEventListener("input", calcLoan); });
  calcLoan();
})();
