function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "header-nav-links") {
        x.className += " responsive";
    } else {
        x.className = "header-nav-links";
    }
}
