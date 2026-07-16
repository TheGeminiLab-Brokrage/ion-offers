/* Ion Offer Generator — UI wiring */
(function () {
  "use strict";
  var E = window.OfferEngine;
  var D = window.OfferData;

  var state = { building: null, unit: null, plan: E.PLANS[0], offer: null };

  var el = {
    pins: document.getElementById("pins"),
    map: document.getElementById("masterplan"),
    mapPanel: document.getElementById("mapPanel"),
    mapWrap: document.getElementById("mapWrap"),
    configPanel: document.getElementById("configPanel"),
    buildingReadout: document.getElementById("buildingReadout"),
    unitSelect: document.getElementById("unitSelect"),
    planSelect: document.getElementById("planSelect"),
    contractDate: document.getElementById("contractDate"),
    agentName: document.getElementById("agentName"),
    agentPhone: document.getElementById("agentPhone"),
    summary: document.getElementById("summary"),
    sumTitle: document.getElementById("sumTitle"),
    sumSub: document.getElementById("sumSub"),
    priceLabel: document.getElementById("priceLabel"),
    priceValue: document.getElementById("priceValue"),
    sumPlan: document.getElementById("sumPlan"),
    schedule: document.getElementById("schedule"),
    extras: document.getElementById("extras"),
    downloadBtn: document.getElementById("downloadBtn"),
    statusHint: document.getElementById("statusHint"),
    seedFlag: document.getElementById("seedFlag"),
  };

  // ── Init controls ──
  function init() {
    if (D.isSeed) el.seedFlag.hidden = false;

    // default contract date = today
    var t = new Date();
    el.contractDate.value = t.getFullYear() + "-" +
      String(t.getMonth() + 1).padStart(2, "0") + "-" +
      String(t.getDate()).padStart(2, "0");

    // plans dropdown
    E.PLANS.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p.id; o.textContent = p.label;
      el.planSelect.appendChild(o);
    });
    el.planSelect.value = state.plan.id;

    // pins
    D.buildings.forEach(function (b) {
      var btn = document.createElement("button");
      btn.className = "pin";
      btn.style.left = (b.pin.x * 100) + "%";
      btn.style.top = (b.pin.y * 100) + "%";
      btn.dataset.code = b.code;
      btn.innerHTML = '<span class="pin-dot"><span>' + b.code.replace("B", "") + "</span></span>";
      btn.addEventListener("click", function () { selectBuilding(b); });
      el.pins.appendChild(btn);
    });

    el.unitSelect.addEventListener("change", onUnitChange);
    el.planSelect.addEventListener("change", onPlanChange);
    [el.contractDate, el.agentName, el.agentPhone].forEach(function (i) {
      i.addEventListener("input", recompute);
    });
    el.downloadBtn.addEventListener("click", onDownload);
  }

  function selectBuilding(b) {
    state.building = b;
    Array.prototype.forEach.call(el.pins.children, function (p) {
      p.classList.toggle("selected", p.dataset.code === b.code);
    });
    el.buildingReadout.textContent = b.code + " — " + b.units.length + " units available";
    el.buildingReadout.classList.remove("empty");

    // advance the guided flow: step 1 done, step 2 active + unlocked
    el.mapWrap.classList.remove("inviting");
    el.mapPanel.classList.remove("is-active");
    el.mapPanel.classList.add("is-done");
    el.configPanel.classList.remove("locked");
    el.configPanel.classList.add("is-active");
    el.unitSelect.classList.add("needs-pick"); // point the agent to the next control

    el.unitSelect.disabled = false;
    el.unitSelect.innerHTML = '<option value="">Select a unit…</option>';
    b.units.forEach(function (u, i) {
      var o = document.createElement("option");
      o.value = i;
      o.textContent = u.code + " · " + u.area + " m² · " + u.type + " · " + E.fmtMoney(u.price) + " LE";
      el.unitSelect.appendChild(o);
    });
    state.unit = null;
    el.summary.hidden = true;
    el.downloadBtn.disabled = true;
  }

  function onUnitChange() {
    var i = el.unitSelect.value;
    state.unit = (i === "") ? null : state.building.units[+i];
    el.unitSelect.classList.toggle("needs-pick", i === ""); // clear the highlight once picked
    recompute();
  }
  function onPlanChange() {
    state.plan = E.PLANS.find(function (p) { return p.id === el.planSelect.value; });
    recompute();
  }

  function contractDateObj() {
    var parts = el.contractDate.value.split("-");
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  function recompute() {
    if (!state.unit) { el.summary.hidden = true; el.downloadBtn.disabled = true; return; }
    var offer = E.computeOffer(state.unit.price, state.plan, contractDateObj());
    state.offer = offer;
    renderSummary(offer);
    el.summary.hidden = false;
    el.downloadBtn.disabled = false;
  }

  function renderSummary(o) {
    var u = state.unit;
    el.sumTitle.textContent = u.area + "m / " + u.bedrooms + " Bdr";
    el.sumSub.textContent = u.category + " · " + u.finish + " · " + state.building.code + " · " + u.floor + " Floor";
    el.priceLabel.textContent = (o.plan.type === "cash") ? "Cash Price" : "Installment Price";
    el.priceValue.textContent = E.fmtMoney(o.net) + " LE";
    el.sumPlan.textContent = "Down Payment " + o.plan.downPct.toFixed(1) + "% / " +
      (o.plan.type === "cash" ? "Cash" : o.plan.years + " Years") +
      " & (" + o.plan.discount + "%) Discount" + (o.plan.type === "cash" ? "" : " / Equal");

    // live floor plan for the selected unit
    var fpSrc = window.OfferAssets && (window.OfferAssets["fp-" + u.floorplan] || window.OfferAssets["fp-2br-t1"]);
    var ul = document.getElementById("unitLayout"), fpImg = document.getElementById("floorplanImg");
    if (fpSrc && ul && fpImg) { fpImg.src = fpSrc; ul.hidden = false; } else if (ul) { ul.hidden = true; }

    // schedule table
    var head = "<thead><tr><th>Installment</th><th>(%)</th><th class='amt'>Amount</th><th>Due Date</th></tr></thead>";
    var body = "<tbody>";
    o.rows.forEach(function (r) {
      body += "<tr class='" + (r.isDown ? "down" : "") + "'>" +
        "<td>" + r.label + "</td>" +
        "<td class='pct'>" + (r.isDown ? Math.round(r.pct) : r.pct) + " %</td>" +
        "<td class='amt'>" + E.fmtMoney(r.amount) + " LE</td>" +
        "<td>" + E.fmtDate(r.date) + "</td></tr>";
    });
    body += "<tr class='total'><td>Total</td><td>100%</td><td class='amt'>" + E.fmtMoney(o.total) + " LE</td><td></td></tr>";
    body += "</tbody>";
    el.schedule.innerHTML = head + body;

    el.extras.innerHTML =
      "<div class='xrow'><span>Maintenance (" + o.config.maintenancePct + "%) — due " + E.fmtDate(o.maintenanceDue) + "</span><b>" + E.fmtMoney(o.maintenance) + " LE</b></div>" +
      "<div class='xrow'><span>Parking Fees</span><b>" + E.fmtMoney(o.parking) + " LE</b></div>" +
      "<div class='xrow'><span>Club Fees</span><b>" + o.clubFees + "</b></div>";
  }

  function onDownload() {
    if (!window.OfferPDF || !state.offer) return;
    el.downloadBtn.disabled = true;
    var prev = el.downloadBtn.textContent;
    el.downloadBtn.textContent = "Building PDF…";
    el.statusHint.innerHTML = "";
    var u = state.unit;
    var name = "Ion-" + u.building + "-" + u.code + "-" + u.area + "m-Offer.pdf";
    window.OfferPDF.generate(state, { save: false })
      .then(function (doc) {
        var url = doc.output("bloburl");
        // 1) try a normal download (works locally / when hosted on a real domain)
        try {
          var a = document.createElement("a");
          a.href = url; a.download = name; a.rel = "noopener";
          document.body.appendChild(a); a.click(); a.remove();
        } catch (e) { /* sandbox may block — fall through to visible link */ }
        // 2) always expose a reliable, tappable link (needed inside the shared-link frame & on mobile)
        el.statusHint.innerHTML =
          '<a class="pdf-open-link" href="' + url + '" target="_blank" rel="noopener" download="' + name + '">Open / Save your PDF offer →</a>' +
          '<br><span style="font-size:11px">If the download didn\'t start automatically, tap the button above.</span>';
      })
      .catch(function (err) {
        el.statusHint.textContent = "PDF error: " + err.message;
      })
      .then(function () {
        el.downloadBtn.textContent = prev;
        el.downloadBtn.disabled = false;
      });
  }

  // test/integration hook
  window.__getOfferState = function () { return state; };

  document.addEventListener("DOMContentLoaded", init);
})();
