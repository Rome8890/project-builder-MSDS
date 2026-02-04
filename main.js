document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const chemicalNameInput = document.getElementById('chemical-name');
    const warningContainer = document.getElementById('warning-container');
    const warningOutput = document.getElementById('warning-output');

    generateBtn.addEventListener('click', () => {
        const chemicalName = chemicalNameInput.value.trim();
        if (!chemicalName) {
            alert('Please enter a chemical name.');
            return;
        }

        const selectedHazards = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(checkbox => checkbox.value);

        if (selectedHazards.length === 0) {
            alert('Please select at least one hazard type.');
            return;
        }

        const warningText = `**MATERIAL SAFETY DATA SHEET**\n\n` +
                          `**Chemical:** ${chemicalName}\n\n` +
                          `**Hazards:**\n` +
                          `${selectedHazards.map(hazard => `- ${hazard}`).join('\n')}`;

        warningOutput.textContent = warningText;
        warningContainer.style.display = 'block';
    });
});
