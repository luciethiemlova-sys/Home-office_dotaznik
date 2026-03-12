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
        // Simple validation for required fields in current step
        const currentPane = document.querySelector(`.step[data-step="${currentStep}"]`);
        const inputs = currentPane.querySelectorAll('[required]');
        let valid = true;

        inputs.forEach(input => {
            // Special check for hidden inputs (like scales)
            if (input.tagName === 'INPUT' && input.type === 'hidden') {
                if (!input.value) {
                    valid = false;
                    // Highlight the container instead
                    const container = input.closest('.scale-container');
                    if (container) container.style.border = '1px solid #ef4444';
                } else {
                    const container = input.closest('.scale-container');
                    if (container) container.style.border = 'none';
                }
            } else if (!input.value) {
                valid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        if (!valid) {
            alert('Prosím vyplňte všechna povinná pole.');
            return;
        }

        // Conditional logic for Step 3
        if (currentStep === 3) {
            const actualMode = currentPane.querySelector('input[name="compare_actual"]:checked');
            if (actualMode && actualMode.value === 'Plně kancelář') {
                // Trigger form submission
                form.dispatchEvent(new Event('submit', { cancelable: true }));
                return;
            }
        }

        // Conditional logic for Step 6 (Branching)
        if (currentStep === 6) {
            const role = document.querySelector('input[name="role"]:checked')?.value;
            if (role === 'C-level' || role === 'Majitel') {
                goToStep(7);
            } else {
                goToStep(8);
            }
            return;
        }

        // Branching back to common path from Management (7) or Employee (8)
        if (currentStep === 7 || currentStep === 8) {
            goToStep(9);
            return;
        }

        goToStep(currentStep + 1);
    };

    window.prevStep = (currentStep) => {
        // Returning to branch from Step 9
        if (currentStep === 9) {
            const role = document.querySelector('input[name="role"]:checked')?.value;
            if (role === 'C-level' || role === 'Majitel') {
                goToStep(7);
            } else {
                goToStep(8);
            }
            return;
        }

        // Returning from Employee branch start
        if (currentStep === 8) {
            goToStep(6);
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Odesílám...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Sloučení checkboxů se stejným názvem (advantage, disadvantage, problems)
            const checkboxes = ['advantage', 'disadvantage', 'problems'];
            checkboxes.forEach(name => {
                const values = formData.getAll(name).join(', ');
                data[name] = values;
                // Přidání "jiné" textu k hodnotám, pokud je vyplněn
                if (data[`${name}_other`] && data[`${name}_other`].trim() !== '') {
                    data[name] += (data[name] ? ', ' : '') + data[`${name}_other`];
                }
            });

            // Handle management other fields
            ['management_fears', 'management_evaluation'].forEach(name => {
                if (data[name] === 'Jine' && data[`${name}_other`]) {
                    data[name] = data[`${name}_other`];
                }
            });

            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3ru8bGEAm7GTSIUQxOkQ6YRqVGH5QjADEm0gyIxnmODxogWFnUp2KOJFXs9vbOT9C/exec';

            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            goToStep(10); // Ukázat úspěch

        } catch (error) {
            console.error('Chyba:', error);
            alert('Došlo k technické chybě. Zkontrolujte prosím připojení k internetu.');
            submitButton.disabled = false;
            submitButton.textContent = 'Odeslat dotazník';
        }
    });
});
