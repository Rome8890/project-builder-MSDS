
document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const generateBtn = document.getElementById('generateBtn');
    const chemicalNameInput = document.getElementById('chemName');
    const warningOutput = document.getElementById('warningOutput');
    const warningContainer = document.querySelector('.output-section');
    const langToggleBtn = document.getElementById('langToggle');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // API Configuration
    const KOSHA_MSDS_API_BASE_URL = 'https://msds.kosha.or.kr/openapi/service/msdschem';
    const KOSHA_MSDS_API_KEY = 'f2e6e376e7edc476fd0e6243533b9d603cdedaa4ab864bcb206bde1b47d50a38';

    // Translations
    const translations = {
        ko: {
            page_title: "MSDS 경고 생성기",
            main_title: "화학물질 경고문 즉시 생성",
            main_subtitle: "화학물질명을 입력하여 즉시 MSDS/SDS 경고문을 만드세요.",
            step1_title: "1. 화학물질 정보 입력",
            chem_name_label: "화학물질명:",
            generate_button: "경고 라벨 생성",
            pdf_button: "PDF 다운로드",
            generated_warning_title: "생성된 경고 라벨",
            contact_title: "제휴 문의",
            contact_name: "이름:",
            contact_email: "이메일:",
            contact_company: "회사명:",
            contact_message: "문의 내용:",
            submit_button: "제출",
            footer_copyright: "© 2026 MSDS Warning Generator. All rights reserved.",
            footer_disclaimer: "생성된 경고는 정보 제공 목적으로만 사용되어야 하며, 공식 MSDS/SDS 문서를 대체할 수 없습니다.",
            error_chemical_name_empty: "화학물질명을 입력해주세요.",
            error_api_no_result: "해당 화학물질을 찾을 수 없습니다. 철자를 확인하거나 다른 이름으로 시도해주세요.",
            error_api_failed: "API에서 데이터를 가져오는 데 실패했습니다.",
            error_cors_detailed: "<b>[개발자 정보]</b><br>브라우저의 보안 정책(CORS)으로 인해 API 요청이 차단된 것으로 보입니다. 이는 웹페이지에서 외부 API를 직접 호출할 때 발생하는 일반적인 문제입니다.<br><br><b>해결 제안:</b><br><ol style='text-align: left; margin-left: 20px;'><li>Visual Studio Code의 'Live Server' 확장 기능으로 프로젝트를 여세요.</li><li>브라우저 개발자 도구(F12)의 콘솔 탭에서 더 자세한 오류를 확인하세요.</li></ol>",
            loading_message: "화학물질 데이터를 불러오는 중...",
            signal_word_header: "신호어",
            hazard_statement_header: "유해·위험 문구",
            precautionary_statement_header: "예방조치 문구",
            lang_button: "English",
            chem_name_placeholder: "예: 아세톤, 이소프로필알코올"
        },
        en: {
            page_title: "MSDS Warning Generator",
            main_title: "Instant Chemical Warning Generator",
            main_subtitle: "Create MSDS/SDS warnings instantly by entering a chemical name.",
            step1_title: "1. Enter Chemical Information",
            chem_name_label: "Chemical Name:",
            generate_button: "Generate Warning Label",
            pdf_button: "Download PDF",
            generated_warning_title: "Generated Warning Label",
            contact_title: "Partnership Inquiry",
            contact_name: "Name:",
            contact_email: "Email:",
            contact_company: "Company Name:",
            contact_message: "Message:",
            submit_button: "Submit",
            footer_copyright: "© 2026 MSDS Warning Generator. All rights reserved.",
            footer_disclaimer: "Generated warnings are for informational purposes only and should not replace official MSDS/SDS documents.",
            error_chemical_name_empty: "Please enter a chemical name.",
            error_api_no_result: "Could not find the chemical. Please check spelling or try another name.",
            error_api_failed: "Failed to fetch data from the API.",
            error_cors_detailed: "<b>[Developer Info]</b><br>The API request was likely blocked by the browser's security policy (CORS). This is common when calling an external API from a webpage.<br><br><b>Suggestions:</b><br><ol style='text-align: left; margin-left: 20px;'><li>Open this project with the 'Live Server' extension in Visual Studio Code.</li><li>Check the browser's developer console (F12) for more detailed errors.</li></ol>",
            loading_message: "Loading chemical data...",
            signal_word_header: "Signal Word",
            hazard_statement_header: "Hazard Statements",
            precautionary_statement_header: "Precautionary Statements",
            lang_button: "한국어",
            chem_name_placeholder: "e.g., Acetone, Isopropyl alcohol"
        }
    };
    let currentLanguage = 'ko';

    // --- Helper Functions ---

    const updateText = () => {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (translations[currentLanguage][key]) {
                el.textContent = translations[currentLanguage][key];
            }
        });
        document.title = translations[currentLanguage].page_title;
        chemicalNameInput.placeholder = translations[currentLanguage].chem_name_placeholder;
        langToggleBtn.textContent = translations[currentLanguage].lang_button;
    };

    const displayMessage = (html, isError = false) => {
        warningOutput.innerHTML = html;
        warningOutput.className = isError ? 'warning-card error' : 'warning-card';
        warningContainer.style.display = 'block';
    };

    const fetchApiData = async (endpoint, params) => {
        const url = new URL(`${KOSHA_MSDS_API_BASE_URL}/${endpoint}`);
        url.searchParams.append('serviceKey', KOSHA_MSDS_API_KEY);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
        
        const response = await fetch(url, { headers: { 'Accept': 'application/xml' } });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        
        const text = await response.text();
        const xmlDoc = new DOMParser().parseFromString(text, "application/xml");
        
        const resultCode = xmlDoc.querySelector('resultCode, ResultCode')?.textContent;
        if (resultCode && resultCode !== '00') {
             const errorMsg = xmlDoc.querySelector('resultMsg, ResultMsg')?.textContent;
             console.warn(`API Warning for ${endpoint}: ${errorMsg} (Code: ${resultCode})`);
        }
        return xmlDoc;
    };

    // --- Core API Logic ---

    const getChemId = async (chemicalName) => {
        const xmlDoc = await fetchApiData('getMsdsChemList', { 'searchWrd': chemicalName, 'searchCnd': '0' });
        const items = xmlDoc.querySelectorAll('item');
        if (items.length === 0) return null;
        const exactMatch = [...items].find(item => 
            (item.querySelector('chemNmKo')?.textContent?.toLowerCase() === chemicalName.toLowerCase()) ||
            (item.querySelector('chemNmEn')?.textContent?.toLowerCase() === chemicalName.toLowerCase())
        );
        return exactMatch?.querySelector('chemId')?.textContent || items[0].querySelector('chemId')?.textContent;
    };

    const getChemicalDetails = async (chemId) => {
        const [pictogramXml, summaryXml] = await Promise.all([
            fetchApiData('getMsdsGhsPictogramInfo', { 'chemId': chemId }),
            fetchApiData('getMsdsSftyInfo', { 'chemId': chemId })
        ]);

        const pictograms = [...pictogramXml.querySelectorAll('item')]
            .map(item => item.querySelector('pictogramUrl')?.textContent)
            .filter(Boolean);

        const summaryItem = summaryXml.querySelector('item');
        const hPhrasesText = summaryItem?.querySelector('hPhrase')?.textContent || '';
        const pPhrasesText = summaryItem?.querySelector('pPhrase')?.textContent || '';

        return {
            pictograms,
            signalWord: summaryItem?.querySelector('signalWrd')?.textContent || '정보 없음',
            hPhrases: hPhrasesText.split('<br/>').filter(p => p.trim()).map(p => `<li>${p.trim()}</li>`).join('') || '<li>정보 없음</li>',
            pPhrases: pPhrasesText.split('<br/>').filter(p => p.trim()).map(p => `<li>${p.trim()}</li>`).join('') || '<li>정보 없음</li>',
        };
    };

    // --- HTML Rendering ---

    const buildWarningLabelHtml = (details, chemicalName) => {
        const pictogramHtml = details.pictograms.length > 0
            ? details.pictograms.map(url => `<img src="${url}" alt="GHS Pictogram" class="ghs-pictogram">`).join('')
            : '<p>그림문자 정보 없음</p>';

        return `
            <h3 data-lang-key="generated_warning_title">${translations[currentLanguage].generated_warning_title}</h3>
            <p><strong>${translations[currentLanguage].chem_name_label}</strong> ${chemicalName}</p>
            <div class="ghs-pictogram-container">${pictogramHtml}</div>
            <div class="signal-word">
                <h4>${translations[currentLanguage].signal_word_header}</h4>
                <p class="${(details.signalWord === '위험' || details.signalWord.toLowerCase() === 'danger') ? 'danger' : 'warning'}">${details.signalWord}</p>
            </div>
            <div class="hazard-statements">
                <h4>${translations[currentLanguage].hazard_statement_header}</h4>
                <ul>${details.hPhrases}</ul>
            </div>
            <div class="precautionary-statements">
                <h4>${translations[currentLanguage].precautionary_statement_header}</h4>
                <ul>${details.pPhrases}</ul>
            </div>
        `;
    };

    // --- Event Listeners ---

    generateBtn.addEventListener('click', async () => {
        const chemicalName = chemicalNameInput.value.trim();
        if (!chemicalName) {
            displayMessage(`<p>${translations[currentLanguage].error_chemical_name_empty}</p>`, true);
            return;
        }

        displayMessage(`<p>${translations[currentLanguage].loading_message}</p>`);
        warningContainer.scrollIntoView({ behavior: 'smooth' });

        try {
            const chemId = await getChemId(chemicalName);
            if (!chemId) {
                displayMessage(`<p>${translations[currentLanguage].error_api_no_result}</p>`, true);
                return;
            }
            const chemicalDetails = await getChemicalDetails(chemId);
            const finalHtml = buildWarningLabelHtml(chemicalDetails, chemicalName);
            displayMessage(finalHtml);
        } catch (error) {
            console.error("Error during API fetch:", error);
            let basicMessage = translations[currentLanguage].error_api_failed;
            let detailedMessage = '';

            if (error instanceof TypeError) { // Network errors, often CORS
                detailedMessage = translations[currentLanguage].error_cors_detailed;
            }
            
            displayMessage(`<p>${basicMessage}<br><br>${detailedMessage}</p>`, true);
        }
    });

    langToggleBtn.addEventListener('click', () => {
        currentLanguage = (currentLanguage === 'ko') ? 'en' : 'ko';
        updateText();
    });

    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    });

    downloadPdfBtn.addEventListener('click', () => {
        if (!warningOutput.innerHTML || warningOutput.querySelector('.error')) {
            alert('Please generate a valid warning first.');
            return;
        }
        
        const chemicalName = chemicalNameInput.value.trim() || 'warning';
        html2canvas(warningOutput, {
            scale: 2,
            useCORS: true,
            backgroundColor: document.body.classList.contains('dark-mode') ? '#1a1a2e' : '#f0f2f5'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            if (contentHeight > pdfHeight - (margin * 2)) {
                alert("생성된 콘텐츠가 PDF 한 페이지에 담기에는 너무 깁니다. PDF 생성 기능은 계속 개선 중입니다.");
                return;
            }
            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
            pdf.save(`${chemicalName}-MSDS-Warning.pdf`);
        });
    });

    // --- Initialization ---
    updateText();
    warningContainer.style.display = 'none';
});
