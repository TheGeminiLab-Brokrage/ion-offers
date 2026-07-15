/* Validate the engine against the real generated offer (113 m² 2BR, 7%/7yr). */
var E = require("./engine.js");

var listPrice = 5852835; // 113 m² 2BR from the price list
var plan = E.PLANS.find(function (p) { return p.id === "p7"; }); // 7% / 7yr / 7.5% discount
var contract = new Date(2026, 6, 15); // 15 Jul 2026

var o = E.computeOffer(listPrice, plan, contract);

var expect = {
  net: 5413872,
  down: 378971,
  each: 179818,
  count: 28,
  maintenance: 433110,
  parking: 250000,
  downDate: "15/Jul/2026",
  firstDate: "15/Oct/2026",
  lastDate: "15/Jul/2033",
  maintDue: "15/Jan/2030",
};

var got = {
  net: o.net,
  down: o.down,
  each: o.installmentEach,
  count: o.installmentCount,
  maintenance: o.maintenance,
  parking: o.parking,
  downDate: E.fmtDate(o.rows[0].date),
  firstDate: E.fmtDate(o.rows[1].date),
  lastDate: E.fmtDate(o.rows[o.rows.length - 1].date),
  maintDue: E.fmtDate(o.maintenanceDue),
};

var pass = true;
Object.keys(expect).forEach(function (k) {
  var ok = String(expect[k]) === String(got[k]);
  if (!ok) pass = false;
  console.log((ok ? "  OK  " : " FAIL ") + k.padEnd(12) + " expected=" + expect[k] + "  got=" + got[k]);
});
console.log("\nEach installment % = " + o.rows[1].pct + " (sample: 3.321)");
console.log(pass ? "\n✅ ALL CHECKS PASSED — engine reproduces the sample offer.\n"
                 : "\n❌ MISMATCH — see FAIL rows above.\n");
process.exit(pass ? 0 : 1);
