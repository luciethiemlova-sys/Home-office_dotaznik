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
                "Výhody (výběr)", "Nevýhody (výběr)", "Soulad (škála)",
                "Největší problémy (výběr)", "Jasná pravidla", "Zneužívání",
                "Obavy (Management)", "Vyhodnocování (Management)", "Potřeby vedení (Management)",
                "Výhody (Employee)", "Efektivita (Employee)", "Důvěra (Employee)", "Potřeby zaměstnanců (Employee)",
                "Proč se neshodneme (Závěr)", "Email"
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
            data.problems,
            data.rules_clarity,
            data.misuse,
            data.management_fears,
            data.management_evaluation,
            data.management_needs,
            data.employee_advantages,
            data.employee_efficiency,
            data.employee_trust,
            data.employee_needs,
            data.summary_reason,
            data.user_email
        ]);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
