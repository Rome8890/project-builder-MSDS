document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const chemicalNameInput = document.getElementById('chemical-name');
    const warningContainer = document.getElementById('warning-container');
    const warningOutput = document.getElementById('warning-output');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const langToggleBtn = document.getElementById('lang-toggle-btn');

    let currentLanguage = 'ko';

    const translations = {
        ko: {
            main_title: '물질안전정보 경고 생성기',
            chemical_name_label: '화학물질명:',
            hazard_types_label: '위험 유형:',
            flammable_label: '인화성',
            corrosive_label: '부식성',
            toxic_label: '독성',
            oxidizer_label: '산화성',
            generate_btn: '경고 생성',
            generated_warning_title: '생성된 경고',
            msds_header: '**물질안전보건자료**'
        },
        en: {
            main_title: 'MSDS Warning Generator',
            chemical_name_label: 'Chemical Name:',
            hazard_types_label: 'Hazard Types:',
            flammable_label: 'Flammable',
            corrosive_label: 'Corrosive',
            toxic_label: 'Toxic',
            oxidizer_label: 'Oxidizer',
            generate_btn: 'Generate Warning',
            generated_warning_title: 'Generated Warning',
            msds_header: '**MATERIAL SAFETY DATA SHEET**'
        }
    };

    const updateText = () => {
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (translations[currentLanguage][key]) {
                el.textContent = translations[currentLanguage][key];
            }
        });
    };

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
    });

    langToggleBtn.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
        updateText();
    });

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

        const warningText = `${translations[currentLanguage].msds_header}\n\n` +
                          `**Chemical:** ${chemicalName}\n\n` +
                          `**Hazards:**\n` +
                          `${selectedHazards.map(hazard => `- ${hazard}`).join('\n')}`;

        warningOutput.textContent = warningText;
        warningContainer.style.display = 'block';
    });

    // Initialize with default language
    updateText();
});
