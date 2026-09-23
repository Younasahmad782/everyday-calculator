// Unit converter. Each category has units with a factor to its base unit,
// except temperature which needs its own conversion formulas.
(function () {
  var tabsEl = document.getElementById("category-tabs");
  if (!tabsEl) return;

  var CATEGORIES = {
    length: {
      label: "Length", base: "m",
      units: {
        mm: { label: "Millimeter", factor: 0.001 },
        cm: { label: "Centimeter", factor: 0.01 },
        m: { label: "Meter", factor: 1 },
        km: { label: "Kilometer", factor: 1000 },
        in: { label: "Inch", factor: 0.0254 },
        ft: { label: "Foot", factor: 0.3048 },
        yd: { label: "Yard", factor: 0.9144 },
        mi: { label: "Mile", factor: 1609.344 },
        nmi: { label: "Nautical mile", factor: 1852 }
      }
    },
    weight: {
      label: "Weight", base: "kg",
      units: {
        mg: { label: "Milligram", factor: 0.000001 },
        g: { label: "Gram", factor: 0.001 },
        kg: { label: "Kilogram", factor: 1 },
        t: { label: "Tonne", factor: 1000 },
        oz: { label: "Ounce", factor: 0.028349523125 },
        lb: { label: "Pound", factor: 0.45359237 },
        st: { label: "Stone", factor: 6.35029318 }
      }
    },
    area: {
      label: "Area", base: "m2",
      units: {
        mm2: { label: "Square millimeter", factor: 0.000001 },
        cm2: { label: "Square centimeter", factor: 0.0001 },
        m2: { label: "Square meter", factor: 1 },
        km2: { label: "Square kilometer", factor: 1000000 },
        in2: { label: "Square inch", factor: 0.00064516 },
        ft2: { label: "Square foot", factor: 0.09290304 },
        yd2: { label: "Square yard", factor: 0.83612736 },
        acre: { label: "Acre", factor: 4046.8564224 },
        hectare: { label: "Hectare", factor: 10000 }
      }
    },
    volume: {
      label: "Volume", base: "l",
      units: {
        ml: { label: "Milliliter", factor: 0.001 },
        l: { label: "Liter", factor: 1 },
        m3: { label: "Cubic meter", factor: 1000 },
        cm3: { label: "Cubic centimeter", factor: 0.001 },
        gal: { label: "Gallon (US)", factor: 3.785411784 },
        qt: { label: "Quart (US)", factor: 0.946352946 },
        pt: { label: "Pint (US)", factor: 0.473176473 },
        cup: { label: "Cup (US)", factor: 0.2365882365 },
        floz: { label: "Fluid ounce (US)", factor: 0.0295735295625 }
      }
    },
    temperature: {
      label: "Temperature", base: "c",
      units: { c: { label: "Celsius" }, f: { label: "Fahrenheit" }, k: { label: "Kelvin" } }
    },
    time: {
      label: "Time", base: "s",
      units: {
        ms: { label: "Millisecond", factor: 0.001 },
        s: { label: "Second", factor: 1 },
        min: { label: "Minute", factor: 60 },
        h: { label: "Hour", factor: 3600 },
        day: { label: "Day", factor: 86400 },
        week: { label: "Week", factor: 604800 },
        month: { label: "Month (30 days)", factor: 2592000 },
        year: { label: "Year (365 days)", factor: 31536000 }
      }
    },
    speed: {
      label: "Speed", base: "mps",
      units: {
        mps: { label: "Meter/second", factor: 1 },
        kph: { label: "Kilometer/hour", factor: 0.277777778 },
        mph: { label: "Mile/hour", factor: 0.44704 },
        knot: { label: "Knot", factor: 0.514444444 },
        fps: { label: "Foot/second", factor: 0.3048 }
      }
    },
    digital: {
      label: "Digital Storage", base: "byte",
      units: {
        bit: { label: "Bit", factor: 0.125 },
        byte: { label: "Byte", factor: 1 },
        kb: { label: "Kilobyte", factor: 1024 },
        mb: { label: "Megabyte", factor: Math.pow(1024, 2) },
        gb: { label: "Gigabyte", factor: Math.pow(1024, 3) },
        tb: { label: "Terabyte", factor: Math.pow(1024, 4) },
        pb: { label: "Petabyte", factor: Math.pow(1024, 5) }
      }
    },
    pressure: {
      label: "Pressure", base: "pa",
      units: {
        pa: { label: "Pascal", factor: 1 },
        kpa: { label: "Kilopascal", factor: 1000 },
        bar: { label: "Bar", factor: 100000 },
        psi: { label: "PSI", factor: 6894.757293168 },
        atm: { label: "Atmosphere", factor: 101325 },
        mmhg: { label: "mmHg", factor: 133.322387415 }
      }
    },
    energy: {
      label: "Energy", base: "j",
      units: {
        j: { label: "Joule", factor: 1 },
        kj: { label: "Kilojoule", factor: 1000 },
        cal: { label: "Calorie", factor: 4.184 },
        kcal: { label: "Kilocalorie", factor: 4184 },
        wh: { label: "Watt-hour", factor: 3600 },
        kwh: { label: "Kilowatt-hour", factor: 3600000 }
      }
    },
    power: {
      label: "Power", base: "w",
      units: {
        w: { label: "Watt", factor: 1 },
        kw: { label: "Kilowatt", factor: 1000 },
        mw: { label: "Megawatt", factor: 1000000 },
        hp: { label: "Horsepower", factor: 745.6998716 }
      }
    },
    angle: {
      label: "Angle", base: "deg",
      units: {
        deg: { label: "Degree", factor: 1 },
        rad: { label: "Radian", factor: 57.29577951308232 },
        grad: { label: "Gradian", factor: 0.9 }
      }
    }
  };

  var currentCategory = "length";
  var fromValue = document.getElementById("from-value");
  var toValue = document.getElementById("to-value");
  var fromUnit = document.getElementById("from-unit");
  var toUnit = document.getElementById("to-unit");
  var errorBox = document.getElementById("converter-error");
  var swapBtn = document.getElementById("swap-units");

  function toFahrenheit(c) { return c * 9 / 5 + 32; }
  function toCelsiusFromF(f) { return (f - 32) * 5 / 9; }

  function convertTemperature(value, from, to) {
    var celsius;
    if (from === "c") celsius = value;
    else if (from === "f") celsius = toCelsiusFromF(value);
    else celsius = value - 273.15;

    if (to === "c") return celsius;
    if (to === "f") return toFahrenheit(celsius);
    return celsius + 273.15;
  }

  function buildTabs() {
    tabsEl.innerHTML = "";
    Object.keys(CATEGORIES).forEach(function (key) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = CATEGORIES[key].label;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", key === currentCategory ? "true" : "false");
      btn.addEventListener("click", function () {
        currentCategory = key;
        buildTabs();
        buildUnitSelects();
        calculate();
      });
      tabsEl.appendChild(btn);
    });
  }

  function buildUnitSelects() {
    var cat = CATEGORIES[currentCategory];
    var keys = Object.keys(cat.units);
    [fromUnit, toUnit].forEach(function (select, idx) {
      select.innerHTML = "";
      keys.forEach(function (k) {
        var opt = document.createElement("option");
        opt.value = k;
        opt.textContent = cat.units[k].label;
        select.appendChild(opt);
      });
      select.selectedIndex = idx === 0 ? 0 : Math.min(1, keys.length - 1);
    });
  }

  function showError(msg) {
    errorBox.hidden = false;
    errorBox.textContent = msg;
    toValue.value = "";
  }

  function calculate() {
    errorBox.hidden = true;
    var raw = fromValue.value.trim();
    if (raw === "") { toValue.value = ""; return; }
    var num = parseFloat(raw);
    if (isNaN(num)) { showError("Please enter a valid number."); return; }

    var cat = CATEGORIES[currentCategory];
    var from = fromUnit.value;
    var to = toUnit.value;
    if (!from || !to) { showError("Please select a unit."); return; }

    var result;
    if (currentCategory === "temperature") {
      result = convertTemperature(num, from, to);
    } else {
      var base = num * cat.units[from].factor;
      result = base / cat.units[to].factor;
    }

    if (!isFinite(result)) { showError("Unable to convert those values."); return; }

    var rounded = Math.round((result + Number.EPSILON) * 1e8) / 1e8;
    toValue.value = rounded.toString();
  }

  fromValue.addEventListener("input", calculate);
  fromUnit.addEventListener("change", calculate);
  toUnit.addEventListener("change", calculate);
  swapBtn.addEventListener("click", function () {
    var f = fromUnit.value, t = toUnit.value;
    fromUnit.value = t;
    toUnit.value = f;
    calculate();
  });

  buildTabs();
  buildUnitSelects();
  calculate();
})();
