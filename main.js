document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const chemicalNameInput = document.getElementById('chemical-name');
    const warningContainer = document.getElementById('warning-container');
    const warningOutput = document.getElementById('warning-output');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const chemicalNameError = document.createElement('p'); // For inline error
    chemicalNameError.className = 'error-message';
    chemicalNameInput.parentNode.insertBefore(chemicalNameError, chemicalNameInput.nextSibling);
    const hazardTypeError = document.createElement('p'); // For inline error
    hazardTypeError.className = 'error-message';
    document.querySelector('.checkbox-group').parentNode.insertBefore(hazardTypeError, document.querySelector('.checkbox-group').nextSibling);

    let currentLanguage = 'ko';

    const translations = {
        ko: {
            main_title: '화학물질 경고문 즉시 생성',
            intro_text: '화학물질명과 위험 유형을 선택하여 즉시 MSDS/SDS 경고문을 만드세요.',
            chemical_name_label: '화학물질명:',
            hazard_types_label: '위험 유형:',
            flammable_label: '인화성',
            corrosive_label: '부식성',
            toxic_label: '독성',
            oxidizer_label: '산화성',
            generate_btn: '경고 생성',
            generated_warning_title: '생성된 경고',
            msds_header: '<strong>물질안전보건자료</strong>',
            download_pdf_btn: 'PDF 다운로드',
            partnership_inquiry_title: '제휴 문의',
            form_name_label: '이름:',
            form_email_label: '이메일:',
            form_company_label: '회사명:',
            form_message_label: '문의 내용:',
            form_submit_btn: '제출',
            footer_text: '생성된 경고는 정보 제공 목적으로만 사용되어야 하며, 공식 MSDS/SDS 문서를 대체할 수 없습니다.',
            error_chemical_name_empty: '화학물질명을 입력해주세요.',
            error_hazard_type_empty: '하나 이상의 위험 유형을 선택해주세요.',
            pdf_download_info: 'PDF 다운로드 기능은 현재 개발 중입니다. 공식 MSDS/SDS 문서는 제공되지 않으며, 이 생성기는 정보 제공 목적으로만 사용됩니다.',
            example_chemical_name: '에탄올 (Ethanol)',
            example_generated_warning_title: '경고문 예시'
        },
        en: {
            main_title: 'Instant Chemical Warning Generator',
            intro_text: 'Instantly create MSDS/SDS warnings by selecting a chemical name and hazard types.',
            chemical_name_label: 'Chemical Name:',
            hazard_types_label: 'Hazard Types:',
            flammable_label: 'Flammable',
            corrosive_label: 'Corrosive',
            toxic_label: 'Toxic',
            oxidizer_label: 'Oxidizer',
            generate_btn: 'Generate Warning',
            generated_warning_title: 'Generated Warning',
            msds_header: '<strong>MATERIAL SAFETY DATA SHEET</strong>',
            download_pdf_btn: 'Download PDF',
            partnership_inquiry_title: 'Partnership Inquiry',
            form_name_label: 'Name:',
            form_email_label: 'Email:',
            form_company_label: 'Company Name:',
            form_message_label: 'Message:',
            form_submit_btn: 'Submit',
            footer_text: 'Generated warnings are for informational purposes only and should not replace official MSDS/SDS documents.',
            error_chemical_name_empty: 'Please enter a chemical name.',
            error_hazard_type_empty: 'Please select at least one hazard type.',
            pdf_download_info: 'PDF download functionality is currently under development. Official MSDS/SDS documents are not provided, and this generator is for informational purposes only.',
            example_chemical_name: 'Ethanol',
            example_generated_warning_title: 'Example Warning'
        }
    };

    const displayError = (element, message) => {
        element.textContent = message;
        element.style.color = 'red';
        element.style.fontSize = '0.9em';
        element.style.marginTop = '0.5em';
        element.style.marginBottom = '0.5em';
        element.style.textAlign = 'left';
    };

    const clearErrors = () => {
        chemicalNameError.textContent = '';
        hazardTypeError.textContent = '';
    };

    const updateText = () => {
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (translations[currentLanguage][key]) {
                if (el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'LABEL' || el.tagName === 'BUTTON') {
                    el.textContent = translations[currentLanguage][key];
                } else {
                    // For msds_header which contains HTML, use innerHTML
                    el.innerHTML = translations[currentLanguage][key];
                }
            }
        });
        chemicalNameInput.placeholder = translations[currentLanguage].chemical_name_placeholder || chemicalNameInput.placeholder;
    };

    const showExampleWarning = () => {
        const exampleChemicalName = translations[currentLanguage].example_chemical_name;
        const exampleHazards = [translations[currentLanguage].flammable_label, translations[currentLanguage].toxic_label];
        const hazardListHtml = exampleHazards.map(hazard => `<li>${hazard}</li>`).join('');

        const warningHtml = `
            <p>${translations[currentLanguage].msds_header}</p>
            <p><strong>${translations[currentLanguage].chemical_name_label}</strong> ${exampleChemicalName}</p>
            <p><strong>${translations[currentLanguage].hazard_types_label}</strong></p>
            <ul>${hazardListHtml}</ul>
        `;
        
        warningOutput.innerHTML = warningHtml;
        warningContainer.querySelector('h2').textContent = translations[currentLanguage].example_generated_warning_title;
        warningContainer.style.display = 'block';
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
        showExampleWarning(); // Update example on language change
    });

    generateBtn.addEventListener('click', () => {
        clearErrors(); // Clear previous errors
        let hasError = false;

        const chemicalName = chemicalNameInput.value.trim();
        if (!chemicalName) {
            displayError(chemicalNameError, translations[currentLanguage].error_chemical_name_empty);
            hasError = true;
        }

        const selectedHazards = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(checkbox => {
                const label = document.querySelector(`label[for='${checkbox.id}']`);
                return label.textContent;
            });

        if (selectedHazards.length === 0) {
            displayError(hazardTypeError, translations[currentLanguage].error_hazard_type_empty);
            hasError = true;
        }

        if (hasError) {
            warningContainer.style.display = 'none'; // Hide warning if there are errors
            return;
        }

        const hazardListHtml = selectedHazards.map(hazard => `<li>${hazard}</li>`).join('');

        const warningHtml = `
            <p>${translations[currentLanguage].msds_header}</p>
            <p><strong>${translations[currentLanguage].chemical_name_label}</strong> ${chemicalName}</p>
            <p><strong>${translations[currentLanguage].hazard_types_label}</strong></p>
            <ul>${hazardListHtml}</ul>
        `;

        warningOutput.innerHTML = warningHtml; // Use innerHTML for formatting
        warningContainer.querySelector('h2').textContent = translations[currentLanguage].generated_warning_title;
        warningContainer.style.display = 'block';
    });

    downloadPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const warningContent = document.getElementById('warning-output');

        if (warningContent.innerHTML.trim() === '') {
            alert('Please generate a warning first.');
            return;
        }

        html2canvas(warningContent).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgProps= pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('msds-warning.pdf');
        });
    });

    // Initialize with default language and show example
    updateText();
    showExampleWarning();
});
