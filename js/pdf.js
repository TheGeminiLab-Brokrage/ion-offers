/*
 * Ion Offer Generator — professional multi-page PDF export.
 * Modeled on the Seven Residence sales offer: cover, location, pinned master
 * plan, gallery renders, unit floor plan, and a branded payment schedule.
 * Uses jsPDF (window.jspdf) + assets from window.OfferAssets.
 */
(function (root) {
  "use strict";
  var E = root.OfferEngine, A = root.OfferAssets;

  // Brand palette
  var NAVY = [22, 35, 63], NAVY2 = [34, 55, 95], GREEN = [46, 107, 82],
      LINE = [214, 221, 233], INK = [26, 34, 51], MUTE = [107, 118, 136],
      PAPER = [255, 255, 255], GREENT = [233, 245, 238], NAVYT = [239, 242, 249],
      RED = [224, 72, 61];

  var W = 297, H = 210; // A4 landscape (mm)

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () {
        var isJpg = /\.jpe?g|jpeg/i.test(src) || /^data:image\/jpe?g/i.test(src);
        var fmt = isJpg ? "JPEG" : "PNG";
        // data URIs and same-origin http images can go straight to jsPDF;
        // only re-encode via canvas when we must (and that would taint under file://).
        if (/^data:/i.test(src)) {
          res({ el: img, url: src, w: img.naturalWidth, h: img.naturalHeight, fmt: fmt });
          return;
        }
        var c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        var url = c.toDataURL(isJpg ? "image/jpeg" : "image/png", 0.9);
        res({ el: img, url: url, w: img.naturalWidth, h: img.naturalHeight, fmt: fmt });
      };
      img.onerror = function () { rej(new Error("image failed: " + src)); };
      img.src = src;
    });
  }

  function fitContain(iw, ih, bw, bh) {
    var r = Math.min(bw / iw, bh / ih);
    return { w: iw * r, h: ih * r };
  }
  function fmt(n) { return E.fmtMoney(n); }

  // ── per-page header band with logos ──
  function header(doc, title, sub) {
    doc.setFillColor.apply(doc, PAPER); doc.rect(0, 0, W, H, "F");
    // top hairline
    doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.3);
    doc.line(12, 22, W - 12, 22);
    // ION logo left
    var ion = doc.__img.logoIon;
    if (ion) { var f = fitContain(ion.w, ion.h, 40, 12); doc.addImage(ion.url, ion.fmt, 12, 7, f.w, f.h); }
    // title center-left
    doc.setTextColor.apply(doc, NAVY); doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text(title, W / 2, 13, { align: "center" });
    if (sub) { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor.apply(doc, MUTE); doc.text(sub, W / 2, 18, { align: "center" }); }
    // Prime logo right
    var pr = doc.__img.logoPrime;
    if (pr) { var g = fitContain(pr.w, pr.h, 34, 9); doc.addImage(pr.url, pr.fmt, W - 12 - g.w, 8, g.w, g.h); }
  }

  function footer(doc, label) {
    doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.3); doc.line(12, H - 12, W - 12, H - 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor.apply(doc, MUTE);
    doc.text("Ion · Phase 2 · Prime Developments", 12, H - 7);
    doc.text(label, W - 12, H - 7, { align: "right" });
  }

  // ── cover ──
  function cover(doc, o, unit, agent) {
    doc.setFillColor.apply(doc, PAPER); doc.rect(0, 0, W, H, "F");
    // faint top + bottom navy bands
    doc.setFillColor.apply(doc, NAVY); doc.rect(0, 0, W, 3, "F"); doc.rect(0, H - 20, W, 20, "F");
    // ION logo centered
    var ion = doc.__img.logoIon;
    if (ion) { var f = fitContain(ion.w, ion.h, 70, 26); doc.addImage(ion.url, ion.fmt, (W - f.w) / 2, 26, f.w, f.h); }
    // eyebrow
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor.apply(doc, GREEN);
    doc.text("S A L E S   O F F E R", W / 2, 74, { align: "center" });
    // headline
    doc.setFont("helvetica", "bold"); doc.setFontSize(34); doc.setTextColor.apply(doc, NAVY);
    doc.text(unit.area + "m  /  " + unit.bedrooms + " Bdr", W / 2, 92, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(13); doc.setTextColor.apply(doc, MUTE);
    doc.text(unit.category + "  ·  " + unit.finish + "  ·  " + unit.building + " · " + unit.floor + " Floor", W / 2, 101, { align: "center" });
    // price pill
    var pw = 150, px = (W - pw) / 2, py = 112;
    doc.setFillColor.apply(doc, NAVY); doc.roundedRect(px, py, pw, 22, 3, 3, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(210, 220, 240);
    doc.text(o.plan.type === "cash" ? "Cash Price" : "Installment Price", px + 10, py + 13);
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255, 255, 255);
    doc.text(fmt(o.net) + " LE", px + pw - 10, py + 14, { align: "right" });
    // plan line
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor.apply(doc, GREEN);
    doc.text(planLine(o), W / 2, 144, { align: "center" });

    // footer band content
    var pr = doc.__img.logoPrime;
    if (pr) { var g = fitContain(pr.w, pr.h, 40, 11); doc.addImage(pr.url, pr.fmt, 14, H - 15.5, g.w, g.h); }
    doc.setTextColor(230, 236, 246); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Issued " + E.fmtDate(o.contractDate), W / 2, H - 8, { align: "center" });
    if (agent.name || agent.phone) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
      doc.text((agent.name || "") + (agent.phone ? "   " + agent.phone : ""), W - 14, H - 8, { align: "right" });
    }
  }

  function planLine(o) {
    if (o.plan.type === "cash") return "Cash — " + o.plan.discount + "% Discount";
    return "Down Payment " + o.plan.downPct.toFixed(1) + "% / " + o.plan.years + " Years & (" + o.plan.discount + "%) Discount / Equal";
  }

  // ── full-page image (contain, centered under header) ──
  function imagePage(doc, title, sub, img) {
    header(doc, title, sub);
    var box = { x: 12, y: 26, w: W - 24, h: H - 42 };
    var f = fitContain(img.w, img.h, box.w, box.h);
    doc.addImage(img.url, img.fmt, box.x + (box.w - f.w) / 2, box.y + (box.h - f.h) / 2, f.w, f.h);
  }

  // ── pinned master plan (draw pin on canvas) ──
  function pinnedMasterplan(img, building) {
    var c = document.createElement("canvas");
    c.width = img.w; c.height = img.h;
    var ctx = c.getContext("2d");
    ctx.drawImage(img.el, 0, 0);
    var x = building.pin.x * c.width, y = building.pin.y * c.height;
    var r = Math.max(26, c.width * 0.028);
    // teardrop
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r, -r * 1.5, -r, -r * 2.6, 0, -r * 2.6);
    ctx.bezierCurveTo(r, -r * 2.6, r, -r * 1.5, 0, 0);
    ctx.fillStyle = "rgba(224,72,61,1)";
    ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = r * 0.5; ctx.shadowOffsetY = r * 0.2;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.beginPath(); ctx.arc(0, -r * 1.55, r * 0.62, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.fillStyle = "#16233f"; ctx.font = "bold " + (r * 0.7) + "px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(building.code.replace("B", ""), 0, -r * 1.5);
    ctx.restore();
    return c.toDataURL("image/jpeg", 0.86);
  }

  // ── payment schedule page ──
  function schedulePage(doc, o, unit, building) {
    header(doc, "Payment Plan", unit.area + "m · " + unit.type + " · " + unit.building + "-" + "" + unit.floor);
    var y = 27;
    // summary strip
    doc.setFillColor.apply(doc, NAVYT); doc.roundedRect(12, y, W - 24, 12, 2, 2, "F");
    var cells = [
      ["Unit", unit.building + " · " + unit.code],
      ["Type", unit.area + "m · " + unit.type],
      ["View", unit.view],
      ["Contract", E.fmtDate(o.contractDate)],
      [o.plan.type === "cash" ? "Cash Price" : "Total Price", fmt(o.net) + " LE"],
      ["Plan", o.plan.type === "cash" ? "Cash" : o.plan.downPct.toFixed(0) + "% / " + o.plan.years + "y"],
    ];
    var cw = (W - 24) / cells.length;
    cells.forEach(function (c, i) {
      var cx = 12 + i * cw + 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor.apply(doc, MUTE);
      doc.text(c[0].toUpperCase(), cx, y + 4.5);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor.apply(doc, NAVY);
      doc.text(String(c[1]), cx, y + 9.5);
    });
    y += 15;

    var down = o.rows[0], insts = o.rows.slice(1);

    // down payment full-width row
    function fullRow(label, pct, amount, date, tint, txt) {
      doc.setFillColor.apply(doc, tint); doc.rect(12, y, W - 24, 9, "F");
      doc.setDrawColor.apply(doc, LINE); doc.rect(12, y, W - 24, 9);
      doc.setTextColor.apply(doc, txt || NAVY); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text(label, 16, y + 6);
      doc.text(pct, 120, y + 6, { align: "right" });
      doc.text(amount, 200, y + 6, { align: "right" });
      if (date) doc.text(date, 220, y + 6);
      y += 9;
    }
    fullRow("Down Payment", down.pct + " %", fmt(down.amount) + " LE", E.fmtDate(down.date), GREENT, GREEN);

    if (o.plan.type !== "cash") {
      // two-column installment table — row height adapts so it never reaches the footer
      var colTop = y + 2;
      var half = Math.ceil(insts.length / 2);
      var cols = [{ x: 12, list: insts.slice(0, half) }, { x: 12 + (W - 24) / 2 + 3, list: insts.slice(half) }];
      var colW = (W - 24) / 2 - 3;
      var headerH = 6, footerTop = H - 14, reserveBelow = 42; // total row + 3 extras + disclaimer
      var rh = Math.min(5.8, (footerTop - colTop - reserveBelow - headerH) / half);
      if (rh < 3.6) rh = 3.6;
      var fs = rh < 4.6 ? 6.6 : 7.6;
      cols.forEach(function (col) {
        var cy = colTop;
        doc.setFillColor.apply(doc, NAVY); doc.rect(col.x, cy, colW, headerH, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        doc.text("Installment", col.x + 3, cy + 4);
        doc.text("%", col.x + 42, cy + 4, { align: "right" });
        doc.text("Amount", col.x + 96, cy + 4, { align: "right" });
        doc.text("Due Date", col.x + colW - 3, cy + 4, { align: "right" });
        cy += headerH;
        col.list.forEach(function (r, idx) {
          if ((idx % 2) === 1) { doc.setFillColor(247, 249, 252); doc.rect(col.x, cy, colW, rh, "F"); }
          var ty = cy + rh - 1.7;
          doc.setTextColor.apply(doc, INK); doc.setFont("helvetica", "normal"); doc.setFontSize(fs);
          doc.text(r.label.replace(" Installment", ""), col.x + 3, ty);
          doc.setTextColor.apply(doc, MUTE); doc.text(r.pct + " %", col.x + 42, ty, { align: "right" });
          doc.setTextColor.apply(doc, INK); doc.text(fmt(r.amount), col.x + 96, ty, { align: "right" });
          doc.setTextColor.apply(doc, MUTE); doc.text(E.fmtDate(r.date), col.x + colW - 3, ty, { align: "right" });
          cy += rh;
        });
        doc.setDrawColor.apply(doc, LINE); doc.rect(col.x, colTop, colW, headerH + col.list.length * rh);
      });
      y = colTop + headerH + half * rh + 3;
    }

    // total row
    fullRow("Total", "100 %", fmt(o.total) + " LE", "", NAVYT, NAVY);

    // extras
    y += 2;
    var extras = [
      ["Maintenance (" + o.config.maintenancePct + "%) — due " + E.fmtDate(o.maintenanceDue), fmt(o.maintenance) + " LE"],
      ["Parking Fees", fmt(o.parking) + " LE"],
      ["Club Fees", o.clubFees],
    ];
    extras.forEach(function (ex) {
      doc.setFillColor(245, 247, 250); doc.rect(12, y, W - 24, 7, "F");
      doc.setTextColor.apply(doc, INK); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(ex[0], 16, y + 4.7);
      doc.setFont("helvetica", "bold"); doc.setTextColor.apply(doc, NAVY);
      doc.text(String(ex[1]), W - 16, y + 4.7, { align: "right" });
      y += 7;
    });

    // disclaimer
    y += 2;
    doc.setFont("helvetica", "italic"); doc.setFontSize(7.5); doc.setTextColor.apply(doc, MUTE);
    doc.text("This schedule is an approximate payment plan based on currently available information and is for guidance purposes only.", 12, y + 3);
  }

  // ── main ──
  function generate(state, opts) {
    opts = opts || {};
    var unit = state.unit, o = state.offer, building = state.building;
    var agent = { name: (document.getElementById("agentName") || {}).value || "", phone: (document.getElementById("agentPhone") || {}).value || "" };
    var fpKey = "fp-" + unit.floorplan;

    var need = [
      ["logoIon", A.logoIon], ["logoPrime", A.logoPrime], ["location", A.location],
      ["masterplan", A.masterplan], ["render1", A.render1], ["render2", A.render2], ["render3", A.render3],
      ["floorplan", A[fpKey] || A["fp-2br-a"]],
    ];

    return Promise.all(need.map(function (n) { return loadImage(n[1]).then(function (img) { return [n[0], img]; }); }))
      .then(function (pairs) {
        var imgs = {}; pairs.forEach(function (p) { imgs[p[0]] = p[1]; });
        var jsPDF = root.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
        doc.__img = imgs;

        cover(doc, o, unit, agent);
        doc.addPage(); imagePage(doc, "Location", "Direct access · R8, New Cairo", imgs.location); footer(doc, "Location");
        doc.addPage(); header(doc, "Master Plan", "Building " + building.code); footer(doc, "Master Plan");
        (function () {
          var pin = pinnedMasterplan(imgs.masterplan, building);
          var box = { x: 12, y: 26, w: W - 24, h: H - 42 };
          var f = fitContain(imgs.masterplan.w, imgs.masterplan.h, box.w, box.h);
          doc.addImage(pin, "JPEG", box.x + (box.w - f.w) / 2, box.y + (box.h - f.h) / 2, f.w, f.h);
        })();
        doc.addPage(); imagePage(doc, "Gallery", "Project renders", imgs.render1); footer(doc, "Gallery");
        doc.addPage(); header(doc, "Gallery", "Project renders"); footer(doc, "Gallery");
        (function () {
          var bx = 12, bw = W - 24, bh = (H - 42 - 4) / 2;
          [imgs.render2, imgs.render3].forEach(function (im, i) {
            var f = fitContain(im.w, im.h, bw, bh);
            doc.addImage(im.url, im.fmt, bx + (bw - f.w) / 2, 26 + i * (bh + 4) + (bh - f.h) / 2, f.w, f.h);
          });
        })();
        doc.addPage(); imagePage(doc, "Unit Layout", unit.area + "m · " + unit.type + " · " + unit.finish, imgs.floorplan); footer(doc, "Unit Layout");
        doc.addPage(); schedulePage(doc, o, unit, building); footer(doc, "Payment Plan");

        if (opts.save !== false) {
          var name = "Ion-" + unit.building + "-" + unit.code + "-" + unit.area + "m-Offer.pdf";
          doc.save(name);
        }
        return doc;
      });
  }

  root.OfferPDF = { generate: generate };
})(typeof window !== "undefined" ? window : this);
