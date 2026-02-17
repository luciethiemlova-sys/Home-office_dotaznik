function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const data = JSON.parse(e.postData.contents);

        // Pokud je tabulka prázdná, přidáme záhlaví
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                "Čas", "Kraj", "Role", "Velikost firmy", "Preference",
                "Prod. HO", "Prod. Hybrid", "Prod. Office",
                "Výhody", "Nevýhody", "Frekvence střetů",
                "Příklad střetu", "Řešení", "Role e-commerce", "Email"
            ]);
        }

        // Přidání datového řádku
        sheet.appendRow([
            new Date(),
            data.kraj,
            data.role,
            data.size,
            data.preference,
            data.prod_ho,
            data.prod_hybrid,
            data.prod_office,
            data.advantage,
            data.disadvantage,
            data.conflicts,
            data.conflict_example,
            data.solution,
            data.ecommerce_role,
            data.user_email
        ]);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
