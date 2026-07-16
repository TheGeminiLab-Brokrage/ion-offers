/*
 * Asset lookup for the PDF. In the multi-file app these are relative paths;
 * the artifact build (build-artifact.js) rewrites each to an inlined data URI
 * so the shareable link is fully self-contained.
 */
(function (root) {
  root.OfferAssets = {
    logoIon: "assets/pdf/logo-ion-t.png",
    logoPrime: "assets/pdf/logo-prime-t.png",
    location: "assets/pdf/location.jpg",
    masterplan: "assets/masterplan-web.jpg",
    render1: "assets/pdf/render1.jpg",
    render2: "assets/pdf/render2.jpg",
    render3: "assets/pdf/render3.jpg",
    "fp-2br-t1": "assets/pdf/fp-2br-t1.png",
    "fp-2br-t2": "assets/pdf/fp-2br-t2.png",
    "fp-2br-t3": "assets/pdf/fp-2br-t3.png",
    "fp-3br-t1": "assets/pdf/fp-3br-t1.png",
    "fp-3br-t2": "assets/pdf/fp-3br-t2.png",
    "fp-3br-t3": "assets/pdf/fp-3br-t3.png",
    "fp-3br-t4": "assets/pdf/fp-3br-t4.png",
    "fp-3br-t5": "assets/pdf/fp-3br-t5.png",
    "fp-3br-t6": "assets/pdf/fp-3br-t6.png",
    "fp-3br-t7": "assets/pdf/fp-3br-t7.png",
    "fp-4br-t1": "assets/pdf/fp-4br-t1.png",
    "fp-4br-t2": "assets/pdf/fp-4br-t2.png",
    "fp-4br-t3": "assets/pdf/fp-4br-t3.png",
    "fp-4br-t4": "assets/pdf/fp-4br-t4.png",
    "fp-4br-t5": "assets/pdf/fp-4br-t5.png",
  };
})(typeof window !== "undefined" ? window : this);
