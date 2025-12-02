// read salon from URL
let params = new URLSearchParams(window.location.search);
let salonName = params.get("salon");

// auto-select dropdown option
if (salonName) {
    let select = document.getElementById("salonSelect"); // YOUR SELECT ID
    if (select) {
        for (let opt of select.options) {
            if (opt.text === salonName) {
                opt.selected = true;
                break;
            }
        }
    }
}
