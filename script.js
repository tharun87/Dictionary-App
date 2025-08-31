const inputField = document.querySelector('.input-field');
const searchBtn = document.querySelector('form button');
const result = document.querySelector('.result');
const toggleBtn = document.getElementById("dark-toggle");

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const get_word_info = async (word) => {
    if (!word) {
        result.style.display = "none";
        return;
    }
    try {
        result.innerHTML = "<p>🔍 Searching...</p>";
        result.style.display = "block";

        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) throw new Error("Word not found");

        const data = await response.json();
        const wordData = data[0];

        const wordCap = capitalize(wordData.word); // ✅ NOW it's in the correct scope

        let html = `
            <h2>${wordCap} 
                <button onclick="speakWord('${wordCap}')" class="speak-btn">🔊 Speak</button>
            </h2>`;

        const audio = wordData.phonetics.find(p => p.audio);
        if (audio) {
            html += `<audio controls src="${audio.audio}" class="audio-player"></audio>`;
        }

        wordData.meanings.forEach((meaning, index) => {
            const partOfSpeech = capitalize(meaning.partOfSpeech);

            html += `<div class="meaning-block">`;
            html += `<h3>${index + 1}. ${partOfSpeech}</h3>`;

            meaning.definitions.forEach((def, defIndex) => {
                html += `
                    <p><strong>Definition ${defIndex + 1}:</strong> ${def.definition}</p>
                    ${def.example ? `<p class="example">"${def.example}"</p>` : ""}
                `;
            });

            if (meaning.synonyms?.length) {
                html += `<p><strong>Synonyms:</strong> ${meaning.synonyms.slice(0, 5).join(', ')}</p>`;
            }

            if (meaning.antonyms?.length) {
                html += `<p><strong>Antonyms:</strong> ${meaning.antonyms.slice(0, 5).join(', ')}</p>`;
            }

            html += `</div><hr>`;
        });

        const sourceUrl = wordData.sourceUrls?.[0];
        if (sourceUrl) {
            html += `<div class="read-more"><a href="${sourceUrl}" target="_blank">📖 Read More</a></div>`;
        }

        result.innerHTML = html;

    } catch (error) {
        result.innerHTML = `<p>❌ Could not find the word "<strong>${word}</strong>".</p>`;
        result.style.display = "block";
        console.error(error);
    }
};

const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(utterance);
};

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    get_word_info(inputField.value.trim());
});

inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { // ✅ Fix: capital "Enter"
        e.preventDefault();
        get_word_info(inputField.value.trim());
    }
});

// Dark mode: load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", theme);
});
