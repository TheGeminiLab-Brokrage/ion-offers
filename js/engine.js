/*
 * Ion Offer Generator — payment engine
 * Reverse-engineered from a real generated offer (113 m² 2BR, 7%/7yr plan)
 * and verified to the pound. Works in the browser (window.OfferEngine)
 * and in Node (module.exports) so we can unit-test it.
 */
(function (root) {
  "use strict";

  // ── Project configuration (Ion — Phase 2 — Prime Developments) ──
  var CONFIG = {
    project: "Ion",
    phase: "Phase 2",
    developer: "Prime Developments",
    deliveryYears: 4,
    installmentsPerYear: 4, // QUARTERLY
    maintenancePct: 8, // of net (discounted) price
    maintenanceLeadMonths: 6, // maintenance bulk due 6 months before delivery
    parkingFees: 250000,
    clubFees: "Included",
  };

  // ── Payment plans ──
  // downPct / years / discount(%) — the six "Equal" plans + Cash.
  // The two Front-Loaded plans (12yr, 11yr) are intentionally omitted
  // until we get a worked example for their schedule shape.
  var PLANS = [
    { id: "p10", downPct: 10, years: 10, discount: 0.0, type: "equal", label: "10% Down / 10 Years" },
    { id: "p9",  downPct: 9,  years: 9,  discount: 2.5, type: "equal", label: "9% Down / 9 Years (2.5% Discount)" },
    { id: "p8",  downPct: 8,  years: 8,  discount: 5.0, type: "equal", label: "8% Down / 8 Years (5% Discount)" },
    { id: "p7",  downPct: 7,  years: 7,  discount: 7.5, type: "equal", label: "7% Down / 7 Years (7.5% Discount)" },
    { id: "p6",  downPct: 6,  years: 6,  discount: 10.0, type: "equal", label: "6% Down / 6 Years (10% Discount)" },
    { id: "p4",  downPct: 20, years: 4,  discount: 20.0, type: "equal", label: "20% Down / 4 Years (20% Discount)" },
    { id: "cash", downPct: 100, years: 0, discount: 35.0, type: "cash", label: "Cash (35% Discount)" },
  ];

  // ── Helpers ──
  function addMonths(date, months) {
    var d = new Date(date.getTime());
    var targetMonth = d.getMonth() + months;
    var targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
    var m = ((targetMonth % 12) + 12) % 12;
    d.setFullYear(targetYear, m, date.getDate());
    return d;
  }

  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(d) {
    return d.getDate() + "/" + MONTHS[d.getMonth()] + "/" + d.getFullYear();
  }
  function ordinal(n) {
    var s = ["th","st","nd","rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function fmtMoney(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  /**
   * Compute a full offer breakdown.
   * @param {number} listPrice  The "Installment Price" from the price list.
   * @param {object} plan       One of PLANS.
   * @param {Date}   contractDate
   * @returns {object} rows, totals, and metadata for rendering.
   */
  function computeOffer(listPrice, plan, contractDate) {
    var disc = plan.discount / 100;
    var net = Math.round(listPrice * (1 - disc));
    var maintenance = Math.round(net * CONFIG.maintenancePct / 100);
    var maintenanceDue = addMonths(contractDate, CONFIG.deliveryYears * 12 - CONFIG.maintenanceLeadMonths);

    var rows = [];

    if (plan.type === "cash") {
      rows.push({
        label: "Cash Payment",
        pct: 100,
        amount: net,
        date: contractDate,
      });
      return {
        listPrice: listPrice, net: net, plan: plan,
        rows: rows, total: net,
        maintenance: maintenance, maintenanceDue: maintenanceDue,
        parking: CONFIG.parkingFees, clubFees: CONFIG.clubFees,
        contractDate: contractDate, config: CONFIG,
      };
    }

    var down = Math.round(net * plan.downPct / 100);
    var n = plan.years * CONFIG.installmentsPerYear;
    var remaining = net - down;
    var each = Math.round(remaining / n);

    rows.push({ label: "Down Payment", pct: plan.downPct, amount: down, date: contractDate, isDown: true });
    for (var k = 1; k <= n; k++) {
      rows.push({
        label: ordinal(k) + " Installment",
        pct: +(each / net * 100).toFixed(3),
        amount: each,
        date: addMonths(contractDate, CONFIG.installmentsPerYear === 4 ? 3 * k : k),
      });
    }

    return {
      listPrice: listPrice, net: net, plan: plan,
      rows: rows, total: net,
      down: down, installmentCount: n, installmentEach: each,
      maintenance: maintenance, maintenanceDue: maintenanceDue,
      parking: CONFIG.parkingFees, clubFees: CONFIG.clubFees,
      contractDate: contractDate, config: CONFIG,
    };
  }

  var api = {
    CONFIG: CONFIG,
    PLANS: PLANS,
    computeOffer: computeOffer,
    fmtDate: fmtDate,
    fmtMoney: fmtMoney,
    ordinal: ordinal,
    addMonths: addMonths,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OfferEngine = api;
})(typeof window !== "undefined" ? window : this);
