// Main calculator: safe, no eval(). Tracks a running value + pending operator.
(function () {
  var valueEl = document.getElementById("calc-value");
  var exprEl = document.getElementById("calc-expression");
  var historyList = document.getElementById("calc-history-list");
  var clearHistoryBtn = document.getElementById("calc-clear-history");
  if (!valueEl) return; // not on this page

  var MAX_DIGITS = 15;
  var state = {
    current: "0",
    previous: null,
    operator: null,
    justEvaluated: false,
    error: false
  };

  var HISTORY_KEY = "calc-history";

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 10)));
    } catch (e) { /* storage unavailable - ignore */ }
  }

  function renderHistory() {
    var list = loadHistory();
    historyList.innerHTML = "";
    if (list.length === 0) {
      historyList.innerHTML = '<li class="empty">No calculations yet.</li>';
      return;
    }
    list.forEach(function (item) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + item.expr + "</span><span>" + item.result + "</span>";
      historyList.appendChild(li);
    });
  }

  function addHistory(expr, result) {
    var list = loadHistory();
    list.unshift({ expr: expr, result: result });
    saveHistory(list);
    renderHistory();
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "Error";
    if (Math.abs(n) > 1e15) {
      return n.toExponential(6);
    }
    var rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10;
    var str = rounded.toString();
    if (str.replace("-", "").replace(".", "").length > MAX_DIGITS) {
      return rounded.toExponential(6);
    }
    return str;
  }

  function opSymbol(op) {
    return { "+": "+", "-": "−", "*": "×", "/": "÷" }[op] || op;
  }

  function updateDisplay() {
    valueEl.textContent = state.error ? "Error" : state.current;
    if (state.operator && state.previous !== null) {
      exprEl.textContent = state.previous + " " + opSymbol(state.operator) + (state.justEvaluated ? "" : " ...");
    } else {
      exprEl.textContent = "\u00A0";
    }
  }

  function inputDigit(d) {
    if (state.error) resetAll();
    if (state.justEvaluated) {
      state.current = "0";
      state.previous = null;
      state.operator = null;
      state.justEvaluated = false;
    }
    if (state.current.replace("-", "").replace(".", "").length >= MAX_DIGITS) return;
    state.current = state.current === "0" ? d : state.current + d;
  }

  function inputDecimal() {
    if (state.error) resetAll();
    if (state.justEvaluated) {
      state.current = "0";
      state.previous = null;
      state.operator = null;
      state.justEvaluated = false;
    }
    if (state.current.indexOf(".") === -1) state.current += ".";
  }

  function toggleSign() {
    if (state.current === "0") return;
    state.current = state.current.charAt(0) === "-" ? state.current.slice(1) : "-" + state.current;
  }

  function backspace() {
    if (state.error) { resetAll(); return; }
    if (state.current.length <= 1 || (state.current.length === 2 && state.current.charAt(0) === "-")) {
      state.current = "0";
    } else {
      state.current = state.current.slice(0, -1);
    }
  }

  function percent() {
    if (state.error) return;
    var val = parseFloat(state.current);
    if (isNaN(val)) return;
    state.current = formatNumber(val / 100);
  }

  function resetAll() {
    state.current = "0";
    state.previous = null;
    state.operator = null;
    state.justEvaluated = false;
    state.error = false;
  }

  function compute(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/":
        if (b === 0) return null; // division by zero
        return a / b;
      default: return b;
    }
  }

  function setOperator(op) {
    if (state.error) return;
    if (state.operator && !state.justEvaluated) {
      // chain: evaluate pending operation first
      var result = compute(parseFloat(state.previous), parseFloat(state.current), state.operator);
      if (result === null) { showError(); return; }
      state.previous = formatNumber(result);
    } else {
      state.previous = state.current;
    }
    state.operator = op;
    state.current = "0";
    state.justEvaluated = false;
  }

  function showError() {
    state.error = true;
    state.current = "Error";
    state.previous = null;
    state.operator = null;
  }

  function equals() {
    if (state.error || !state.operator || state.previous === null) return;
    var a = parseFloat(state.previous);
    var b = parseFloat(state.current);
    var result = compute(a, b, state.operator);
    if (result === null) { showError(); updateDisplay(); return; }
    if (!isFinite(result)) { showError(); updateDisplay(); return; }
    var exprText = formatNumber(a) + " " + opSymbol(state.operator) + " " + formatNumber(b) + " =";
    var resultText = formatNumber(result);
    addHistory(exprText, resultText);
    state.current = resultText;
    state.previous = a + " " + opSymbol(state.operator) + " " + b;
    state.justEvaluated = true;
  }

  function handleAction(action, target) {
    switch (action) {
      case "digit": inputDigit(target.dataset.digit); break;
      case "decimal": inputDecimal(); break;
      case "sign": toggleSign(); break;
      case "backspace": backspace(); break;
      case "percent": percent(); break;
      case "clear": resetAll(); break;
      case "op": setOperator(target.dataset.op); break;
      case "equals": equals(); break;
    }
    updateDisplay();
  }

  document.querySelectorAll(".calc-keys button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      handleAction(btn.dataset.action, btn);
    });
  });

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      saveHistory([]);
      renderHistory();
    });
  }

  document.addEventListener("keydown", function (e) {
    // Ignore keystrokes typed into other form fields elsewhere on the page.
    if (e.target && e.target.tagName === "INPUT") return;
    if (e.key >= "0" && e.key <= "9") { inputDigit(e.key); updateDisplay(); return; }
    if (e.key === ".") { inputDecimal(); updateDisplay(); return; }
    if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") { setOperator(e.key); updateDisplay(); return; }
    if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); updateDisplay(); return; }
    if (e.key === "Backspace") { backspace(); updateDisplay(); return; }
    if (e.key === "Escape") { resetAll(); updateDisplay(); return; }
    if (e.key === "%") { percent(); updateDisplay(); return; }
  });

  renderHistory();
  updateDisplay();
})();
