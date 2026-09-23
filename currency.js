// Currency converter.
//
// Uses the free, keyless "open.er-api.com" endpoint. It refreshes daily and
// needs no API key, which keeps this tool free to run. If you would rather
// use a provider that requires a key (for example exchangerate-api.com or
// currencyapi.com), replace the fetch URL below and add your key where
// marked "ADD YOUR API KEY HERE".
(function () {
  var amountEl = document.getElementById("cur-amount");
  var resultEl = document.getElementById("cur-result");
  var fromEl = document.getElementById("cur-from");
  var toEl = document.getElementById("cur-to");
  var statusEl = document.getElementById("cur-status");
  var errorEl = document.getElementById("cur-error");
  var swapBtn = document.getElementById("cur-swap");
  if (!amountEl) return;

  var CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "AED", "SAR", "CAD", "AUD", "NZD", "JPY", "CNY", "CHF", "TRY", "MYR", "QAR", "KWD", "BHD", "OMR"];
  var CACHE_KEY = "currency-rates-cache";
  var CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

  // API_KEY: leave blank for the free open.er-api.com endpoint used below.
  // If you switch to a provider that requires a key, put it here.
  var API_KEY = ""; // ADD YOUR API KEY HERE if your chosen provider needs one

  var state = { rates: null, base: "USD", updated: null };

  function buildSelects() {
    CURRENCIES.forEach(function (code) {
      [fromEl, toEl].forEach(function (select) {
        var opt = document.createElement("option");
        opt.value = code;
        opt.textContent = code;
        select.appendChild(opt);
      });
    });
    fromEl.value = "USD";
    toEl.value = "PKR";
  }

  function cacheRates(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, savedAt: Date.now() }));
    } catch (e) { /* ignore storage errors */ }
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function showError(msg) {
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  function hideError() {
    errorEl.hidden = true;
  }

  function fetchRates() {
    // Free, keyless endpoint. Base currency is fixed to USD server-side;
    // we convert through USD for any from/to pair.
    var url = "https://open.er-api.com/v6/latest/USD";
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function (json) {
        if (!json || json.result !== "success" || !json.rates) throw new Error("Unexpected response");
        var data = { base: "USD", rates: json.rates, updated: json.time_last_update_utc || new Date().toUTCString() };
        cacheRates(data);
        return data;
      });
  }

  function applyData(data, fromCache) {
    state.rates = data.rates;
    state.base = data.base;
    state.updated = data.updated;
    setStatus((fromCache ? "Showing last saved rates from " : "Rates last updated ") + state.updated + ".");
    calculate();
  }

  function init() {
    var cached = readCache();
    if (cached) applyData(cached, true);

    fetchRates()
      .then(function (data) { applyData(data, false); })
      .catch(function () {
        if (!cached) {
          setStatus("");
          showError("Unable to retrieve current exchange rates. Please try again later.");
        } else {
          setStatus("Unable to refresh rates right now — showing last saved rates from " + state.updated + ".");
        }
      });
  }

  function calculate() {
    hideError();
    if (!state.rates) return;
    var amount = parseFloat(amountEl.value);
    if (amountEl.value.trim() === "" ) { resultEl.value = ""; return; }
    if (isNaN(amount)) { showError("Please enter a valid number."); resultEl.value = ""; return; }

    var from = fromEl.value, to = toEl.value;
    var fromRate = state.rates[from];
    var toRate = state.rates[to];
    if (!fromRate || !toRate) { showError("Please select a currency."); return; }

    var usdAmount = amount / fromRate;
    var converted = usdAmount * toRate;
    resultEl.value = (Math.round((converted + Number.EPSILON) * 100) / 100).toString();
  }

  amountEl.addEventListener("input", calculate);
  fromEl.addEventListener("change", calculate);
  toEl.addEventListener("change", calculate);
  swapBtn.addEventListener("click", function () {
    var f = fromEl.value, t = toEl.value;
    fromEl.value = t;
    toEl.value = f;
    calculate();
  });

  buildSelects();
  init();
})();
