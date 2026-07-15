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
    masterplan: "assets/masterplan-web.png",
    render1: "assets/pdf/render1.jpg",
    render2: "assets/pdf/render2.jpg",
    render3: "assets/pdf/render3.jpg",
    "fp-2br-a": "assets/pdf/fp-2br-a.png",
    "fp-2br-b": "assets/pdf/fp-2br-b.png",
    "fp-3br-a": "assets/pdf/fp-3br-a.png",
    "fp-3br-b": "assets/pdf/fp-3br-b.png",
    "fp-3br-c": "assets/pdf/fp-3br-c.png",
    "fp-3br-d": "assets/pdf/fp-3br-d.png",
    "fp-4br-a": "assets/pdf/fp-4br-a.png",
  };
})(typeof window !== "undefined" ? window : this);
