document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const ttsTextInput = document.getElementById('tts-text');
    const audioContainer = document.getElementById('audio-container');
    const audioOutput = document.getElementById('audio-output');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const langToggleBtn = document.getElementById('lang-toggle-btn');

    let currentLanguage = 'ko';

    const translations = {
        ko: {
            main_title: 'AI 보이스 생성기',
            intro_text: '텍스트를 자연스러운 인공지능 목소리로 변환해보세요. 지금 바로 문장을 입력하고 생성하기 버튼을 누르세요.',
            text_input_label: '변환할 텍스트:',
            generate_btn: '목소리 생성',
            generated_audio_title: '생성된 오디오',
            text_placeholder: '여기에 텍스트를 입력하세요...',
            error_text_empty: '변환할 텍스트를 입력해주세요.'
        },
        en: {
            main_title: 'AI Voice Generator',
            intro_text: 'Convert text into natural-sounding AI voices. Enter your text below and press generate.',
            text_input_label: 'Text to Convert:',
            generate_btn: 'Generate Voice',
            generated_audio_title: 'Generated Audio',
            text_placeholder: 'Enter text here...',
            error_text_empty: 'Please enter text to convert.'
        }
    };

    const updateText = () => {
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (translations[currentLanguage][key]) {
                el.textContent = translations[currentLanguage][key];
            }
        });
        ttsTextInput.placeholder = translations[currentLanguage].text_placeholder;
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
        const text = ttsTextInput.value.trim();
        if (!text) {
            alert(translations[currentLanguage].error_text_empty);
            return;
        }

        // Disable button to prevent multiple clicks
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        // Simulate API call
        setTimeout(() => {
            // In a real application, you would make a fetch request to your backend here
            // and receive the audio file URL.
            const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder audio

            audioOutput.src = audioUrl;
            audioContainer.style.display = 'block';

            // Re-enable button
            generateBtn.disabled = false;
            updateText(); // Restore original button text
        }, 1500); // Simulate a 1.5-second delay
    });

    // Initialize with default language
    updateText();
});