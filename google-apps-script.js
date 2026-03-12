function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const data = JSON.parse(e.postData.contents);

        // Pokud je tabulka prázdná, přidáme záhlaví
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                "Čas", "Kraj", "Role", "Velikost firmy",
                "Převládající režim ve firmě", "Ideální režim",
                "Výhody", "Nevýhody", "Frekvence střetů",
                "Příklad střetu", "Řešení", "Email"
            ]);
        }

        // Přidání datového řádku
        sheet.appendRow([
            new Date(),
            data.kraj,
            data.role,
            data.size,
            data.current_company_mode,
            data.ideal_mode,
            data.advantage,
            data.disadvantage,
            data.conflicts,
            data.conflict_example,
            data.solution,
            data.user_email
        ]);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
