function switchLanguageShow() {
    let switcher = document.getElementById("languageSwitcher");
    let isJava = switcher.checked
    let containers = document.getElementsByClassName("docsify-tabs docsify-tabs--material")
    for (let container of containers) {
        if (container.getElementsByClassName("languageChangeAware").length === 0) {
            continue
        }
        let raw = container.innerHTML
        if (raw.includes("java")) {
            container.style.display = isJava ? "" : "none"
        } else if (raw.includes("kotlin")) {
            container.style.display = isJava ? "none" : ""
        }
    }

    for (let java of document.getElementsByClassName("languageChangeAware-java")) {
        java.style.display = isJava ? "" : "none"
    }
    for (let kt of document.getElementsByClassName("languageChangeAware-kotlin")) {
        kt.style.display = isJava ? "none" : ""
    }
}