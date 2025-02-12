function createHeart() {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    document.querySelector(".floating-hearts").appendChild(heart);

    let randomX = Math.random() * 100;
    let randomSize = Math.random() * (40 - 15) + 15;
    let randomDuration = Math.random() * (6 - 3) + 3;

    heart.style.left = `${randomX}%`;
    heart.style.width = `${randomSize}px`;
    heart.style.height = `${randomSize}px`;
    heart.style.animationDuration = `${randomDuration}s`;

    setTimeout(() => heart.remove(), randomDuration * 1000);
}
setInterval(createHeart, 500);

function getSynonyms(word) {
    return fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=5&ml=${word}`)
        .then(response => response.json())
        .then(data => {
            return data
                .filter(item => item.score > 1000)
                .map(item => item.word);
        });
}

function getTranslation(text) {
    return fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=en|uk`)
        .then(response => response.json())
        .then(data => data.responseData.translatedText)
        .catch(error => {
            console.error("Error translating text:", error);
            return "";
        });
}

function getPhrase() {
    let word = document.getElementById("wordInput").value.trim().toLowerCase();
    let output = document.getElementById("phraseOutput");
    let translatedOutput = document.getElementById("translatedPhraseOutput");
    let backgroundHeart = document.getElementById("backgroundHeart");

    if (word === "") {
        output.textContent = "Please enter a word!";
        return;
    }

    if (word === "love") {
        backgroundHeart.style.display = "block";
        backgroundHeart.style.zIndex = "10";
        setTimeout(() => {
            backgroundHeart.style.display = "none";
        }, 3000);
    } else {
        backgroundHeart.style.display = "none";
    }

    getSynonyms(word).then(synonyms => {
        let queryParams = new URLSearchParams({
            tags: [word, ...synonyms].join(','),
            limit: 10,
            language: 'en',
            orderby: 'relevance'
        });

        fetch(`https://api.paperquotes.com/apiv1/quotes/?${queryParams}`, {
            headers: {
                'Authorization': 'Token 5f5c04c8d5mshf2ab3',
                'Accept-Language': 'en'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const quotes = data.results.filter(quote => 
                    quote.quote.toLowerCase().includes(word) || 
                    synonyms.some(syn => quote.quote.toLowerCase().includes(syn))
                );
                if (quotes.length > 0) {
                    let randomIndex = Math.floor(Math.random() * quotes.length);
                    let selectedQuote = quotes[randomIndex].quote;
                    output.textContent = selectedQuote;
                    getTranslation(selectedQuote).then(translatedQuote => {
                        translatedOutput.textContent = `Translation: ${translatedQuote}`;
                    });
                } else {
                    output.textContent = "No exact match found!";
                    translatedOutput.textContent = "";
                }
            } else {
                output.textContent = "Quote not found!";
                translatedOutput.textContent = "";
            }
        })
        .catch(error => {
            output.textContent = "Error fetching the quote!";
            console.error("Error:", error);
        });
    });
}
