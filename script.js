document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('survey-form');
    const progressBar = document.getElementById('progress');
    const steps = document.querySelectorAll('.step');
    const totalSteps = steps.length - 1; // Exclude Success step (9 now, excluding Step 10)

    // Handle Option Card Selections
    document.querySelectorAll('.option-card').forEach(card => {
        const input = card.querySelector('input[type="radio"], input[type="checkbox"]');
        const textInput = card.querySelector('input[type="text"]');

        if (input.checked) card.classList.add('selected');

        // Obsluha změny stavu
        input.addEventListener('change', () => {
            if (input.type === 'radio') {
                document.querySelectorAll(`input[name="${input.name}"]`).forEach(btn => {
                    btn.closest('.option-card').classList.toggle('selected', btn.checked);
                });
            } else {
                // Checkbox max-2 validation
                if (input.name === 'advantage' || input.name === 'disadvantage' || input.name === 'problems') {
                    const checked = document.querySelectorAll(`input[name="${input.name}"]:checked`);
                    if (checked.length > 2) {
                        input.checked = false;
                        alert('Prosím, vyberte maximálně 2 možnosti.');
                        return;
                    }
                }
                card.classList.toggle('selected', input.checked);
            }
        });

        // Prevence double-toggle u textových polí
        if (textInput) {
            textInput.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!input.checked) {
                    input.checked = true;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
    });

    // Handle Scale Selections
    document.querySelectorAll('.scale-box').forEach(box => {
        box.addEventListener('click', () => {
            const row = box.closest('.scale-row');
            const hiddenInput = row.querySelector('input[type="hidden"]');

            row.querySelectorAll('.scale-box').forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
            hiddenInput.value = box.dataset.val;

            // Trigger change event on hidden input if needed for validation
            const event = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(event);
        });
    });

    window.nextStep = (currentStep) => {
        const currentPane = document.querySelector(`.step[data-step="${currentStep}"]`);
        let valid = true;

        // Najdi všechny required inputy v tomto kroku
        const requiredInputs = currentPane.querySelectorAll('[required]');

        // Sesbírej unikátní skupiny (podle name) a typ
        const checkedGroups = new Set();

        requiredInputs.forEach(input => {
            if (input.type === 'hidden') {
                // Scale boxy — kontroluj neprázdnou value
                const container = input.closest('.scale-container');
                if (!input.value) {
                    valid = false;
                    if (container) container.style.outline = '2px solid #ef4444';
                } else {
                    if (container) container.style.outline = 'none';
                }
            } else if (input.type === 'radio' || input.type === 'checkbox') {
                // Každou skupinu (name) zkontroluj jen jednou
                if (checkedGroups.has(input.name)) return;
                checkedGroups.add(input.name);

                const group = currentPane.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = currentPane.querySelector(`input[name="${input.name}"]:checked`);
                const grid = input.closest('.options-grid') || input.closest('.comparison-grid');

                if (!isChecked) {
                    valid = false;
                    if (grid) grid.style.outline = '2px solid #ef4444';
                    if (grid) grid.style.borderRadius = '8px';
                } else {
                    if (grid) grid.style.outline = 'none';
                }
            }
        });

        if (!valid) {
            alert('Prosím odpovězte na všechny povinné otázky na této stránce.');
            return;
        }

        // Early exit: Externista on step 1
        if (currentStep === 1) {
            const role = currentPane.querySelector('input[name="role"]:checked')?.value;
            if (role === 'Externista') {
                goToStep(12);
                return;
            }
        }

        // Conditional logic for Step 3 – Plně kancelář early exit
        if (currentStep === 3) {
            const actualMode = currentPane.querySelector('input[name="compare_actual"]:checked');
            if (actualMode && actualMode.value === 'Plně kancelář') {
                // Submit data silently and show goodbye screen
                submitFormData();
                goToStep(13);
                return;
            }
        }

        // Conditional logic for Step 7 (Branching)
        if (currentStep === 7) {
            const role = document.querySelector('input[name="role"]:checked')?.value;
            if (role === 'C-level' || role === 'Majitel') {
                goToStep(8);
            } else {
                goToStep(9);
            }
            return;
        }

        // Branching back to common path from Management (8) or Employee (9)
        if (currentStep === 8 || currentStep === 9) {
            goToStep(10);
            return;
        }

        goToStep(currentStep + 1);
    };

    window.prevStep = (currentStep) => {
        // Back from Plně kancelář goodbye → return to Q4 (step 3)
        if (currentStep === 13) {
            goToStep(3);
            return;
        }

        // Returning to branch from Step 10
        if (currentStep === 10) {
            const role = document.querySelector('input[name="role"]:checked')?.value;
            if (role === 'C-level' || role === 'Majitel') {
                goToStep(8);
            } else {
                goToStep(9);
            }
            return;
        }

        // Returning from Employee branch start
        if (currentStep === 9) {
            goToStep(7);
            return;
        }

        goToStep(currentStep - 1);
    };

    function goToStep(stepNumber) {
        steps.forEach(s => s.classList.remove('active'));
        const targetStep = document.querySelector(`.step[data-step="${stepNumber}"]`);
        if (targetStep) targetStep.classList.add('active');

        // Update progress bar
        const progressPercent = ((stepNumber - 1) / totalSteps) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function submitFormData() {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Sloučení checkboxů se stejným názvem (problems)
            const checkboxes = ['problems'];
            checkboxes.forEach(name => {
                const values = formData.getAll(name).join(', ');
                data[name] = values;
            });

            // Handle management other fields
            ['management_fears', 'management_evaluation'].forEach(name => {
                if (data[name] === 'Jine' && data[`${name}_other`]) {
                    data[name] = data[`${name}_other`];
                }
            });

            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBw3hOp6im5VW1WawlaekCjfQJxQQL6lfGNROtMZr0V4Lo8NWp6h8Qr7mcV0CrT1g9/exec';

            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Chyba při odesílání:', error);
        }
    }

    window.submitSurvey = async () => {
        const submitButton = form.querySelector('button[onclick="submitSurvey()"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Odesílám...';

        try {
            await submitFormData();
            goToStep(11); // Ukázat úspěch
        } catch (error) {
            console.error('Chyba:', error);
            alert('Došlo k technické chybě. Zkontrolujte prosím připojení k internetu.');
            submitButton.disabled = false;
            submitButton.textContent = 'Odeslat dotazník';
        }
    };
});
