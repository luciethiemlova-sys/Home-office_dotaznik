function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const data = JSON.parse(e.postData.contents);

        // Pokud je tabulka prázdná, přidáme záhlaví
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                "Čas", "Kraj", "Role", "Velikost firmy",
                "Převládající režim ve firmě",
                "Ideální stav (srovnání)", "Aktuální stav (srovnání)",
                "Výhody", "Nevýhody", "Soulad", "Frekvence střetů",
                "Příklad střetu", "Největší problémy", "Jasná pravidla", "Zneužívání",
                "Řešení", "Email"
            ]);
        }

        // Přidání datového řádku
        sheet.appendRow([
            new Date(),
            data.kraj,
            data.role,
            data.size,
            data.current_company_mode,
            data.compare_ideal,
            data.compare_actual,
            data.advantage,
            data.disadvantage,
            data.alignment_score,
            data.conflicts_frequency,
            data.conflict_example,
            data.problems,
            data.rules_clarity,
            data.misuse,
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
