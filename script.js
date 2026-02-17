document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('survey-form');
    const progressBar = document.getElementById('progress');
    const steps = document.querySelectorAll('.step');
    const totalSteps = steps.length - 1; // Exclude Success step

    // Handle Option Card Selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const input = card.querySelector('input[type="radio"], input[type="checkbox"]');
            if (e.target !== input && e.target.tagName !== 'INPUT') {
                input.click();
            }
        });

        const input = card.querySelector('input');
        input.addEventListener('change', () => {
            if (input.type === 'radio') {
                // Remove selected from others in same group
                const groupName = input.name;
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(btn => {
                    btn.closest('.option-card').classList.toggle('selected', btn.checked);
                });
            } else if (input.type === 'checkbox') {
                // Validation for max 2 selections
                const groupName = input.name;
                if (groupName === 'advantage' || groupName === 'disadvantage') {
                    const checked = document.querySelectorAll(`input[name="${groupName}"]:checked`);
                    if (checked.length > 2) {
                        input.checked = false;
                        alert('Prosím, vyberte maximálně 2 možnosti.');
                    }
                }
                card.classList.toggle('selected', input.checked);
            }
        });
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
            const response = await fetch('https://formspree.io/f/mqaebrda', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                goToStep(7); // Show success message
            } else {
                alert('Omlouváme se, při odesílání došlo k chybě. Zkuste to prosím znovu.');
                submitButton.disabled = false;
                submitButton.textContent = 'Odeslat dotazník';
            }
        } catch (error) {
            alert('Došlo k technické chybě. Zkontrolujte prosím připojení k internetu.');
            submitButton.disabled = false;
            submitButton.textContent = 'Odeslat dotazník';
        }
    });
});
