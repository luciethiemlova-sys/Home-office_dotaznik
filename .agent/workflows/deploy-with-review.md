---
description: Deploy the application with review steps (staging branch, tests, PR)
---

// turbo-all
1. Review all changes in the current branch.
2. Vytvoř novou větev (staging branch) s názvem `staging-[timestamp]`.
3. Spusť testy (pokud existují).
4. Commitni a pushni změny do staging větve.
5. Vytvoř PR (Pull Request) do hlavní větve (main).
6. Počkej na schválení uživatelem.
7. Po schválení slouči PR a nasaď na Vercel pomocí `npm run deploy`.
