document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('survey-form');
    const progressBar = document.getElementById('progress');
    const steps = document.querySelectorAll('.step');
    const totalSteps = steps.length - 1; // Exclude Success step

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
                if (input.name === 'advantage' || input.name === 'disadvantage') {
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
        });
    });

    window.nextStep = (currentStep) => {
        // Simple validation for required fields in current step
        const currentPane = document.querySelector(`.step[data-step="${currentStep}"]`);
        const inputs = currentPane.querySelectorAll('[required]');
        let valid = true;

        inputs.forEach(input => {
            if (!input.value) {
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

        goToStep(currentStep + 1);
    };

    window.prevStep = (currentStep) => {
        goToStep(currentStep - 1);
    };

    function goToStep(stepNumber) {
        steps.forEach(s => s.classList.remove('active'));
        document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');

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

            // Sloučení checkboxů se stejným názvem (role, advantage, disadvantage)
            const checkboxes = ['role', 'advantage', 'disadvantage'];
            checkboxes.forEach(name => {
                const values = formData.getAll(name).join(', ');
                data[name] = values;
                // Přidání "jiné" textu k hodnotám, pokud je vyplněn
                if (data[`${name}_other`] && data[`${name}_other`].trim() !== '') {
                    data[name] += (data[name] ? ', ' : '') + data[`${name}_other`];
                }
            });

            // Přidání hodnot ze škál
            data.prod_ho = form.querySelector('input[name="prod_ho"]').value;
            data.prod_hybrid = form.querySelector('input[name="prod_hybrid"]').value;
            data.prod_office = form.querySelector('input[name="prod_office"]').value;

            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpnI7PmMpiBZp_01zRN6FpypAOR8NCnvgorPPxaLWHPdFHntZgvhS597Whk4yrzXQM/exec';

            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            goToStep(7); // Ukázat úspěch

        } catch (error) {
            console.error('Chyba:', error);
            alert('Došlo k technické chybě. Zkontrolujte prosím připojení k internetu.');
            submitButton.disabled = false;
            submitButton.textContent = 'Odeslat dotazník';
        }
    });
});
