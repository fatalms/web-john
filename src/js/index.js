let ua = window.navigator.userAgent;
let msie = ua.indexOf("MSIE ");
let isMobile = {
    Android: () => navigator.userAgent.match(/Android/i),
    BlackBerry: () => navigator.userAgent.match(/BlackBerry/i),
    iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
    Opera: () => navigator.userAgent.match(/Opera Mini/i),
    Windows: () => navigator.userAgent.match(/IEMobile/i),
    any: () => isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows(),
};

function isIE() {
    ua = navigator.userAgent;
    let is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
    return is_ie;
}
if (isIE()) {
    document.querySelector("html").classList.add("ie");
}
if (isMobile.any()) {
    document.querySelector("html").classList.add("_touch");
}

function testWebP(callback) {
    let webP = new Image();
    webP.onload = webP.onerror = () => {
        callback(webP.height == 2);
    };
    webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP((support) => {
    if (support === true) {
        document.querySelector("html").classList.add("_webp");
    } else {
        document.querySelector("html").classList.add("_no-webp");
    }
});

function ibg() {
    if (isIE()) {
        let ibg = document.querySelectorAll("._ibg");
        for (let i = 0; i < ibg.length; i++) {
            if (ibg[i].querySelector("img") && ibg[i].querySelector("img").getAttribute("src") != null) {
                ibg[i].style.backgroundImage = "url(" + ibg[i].querySelector("img").getAttribute("src") + ")";
            }
        }
    }
}

ibg();

//Menu
let iconMenu = document.querySelector(".icon-menu");
if (iconMenu) {
    let menuBody = document.querySelector(".menu__body");
    iconMenu.addEventListener("click", (e) => {
        iconMenu.classList.toggle("_active");
        menuBody.classList.toggle("_active");
    });
}
