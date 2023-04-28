const searchButton = document.getElementById("search-button");
const filterDate = document.getElementById("filter-date");
const filterRelevance = document.getElementById("filter-relevance");
const filterPopularity = document.getElementById("filter-popularity");
const resultsList = document.getElementById("results-list");
const keywordInput = document.getElementById("keyword-input");
const addKeywordButton = document.getElementById("add-keyword-button");
const keywordsContainer = document.getElementById("keywords-container");

searchButton.addEventListener("click", () => {
    const keywordsArray = Array.from(keywordsContainer.querySelectorAll(".keyword"));
    const allKeywordTexts = keywordsArray.map(keywordItem => keywordItem.textContent.substring(0, keywordItem.textContent.length - 1).trim());

    searchForArticles(allKeywordTexts);
});

function searchForArticles(keywordsArray, sortBy) {
    fetch('articles.json')
        .then(response => response.json())
        .then(data => {
            const articles = data.articles;

            const matchingArticles = articles.filter(article => {
                const articleText = (article.title + " " + article.abstract).toLowerCase();
                return keywordsArray.every(keyword => articleText.includes(keyword.toLowerCase()));
            });

            displaySearchedArticles(matchingArticles);
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
}

function displaySearchedArticles(articles) {
    resultsList.innerHTML = '';

    articles.forEach(article => {
        const listItem = document.createElement('li');
        listItem.classList.add("article");
        listItem.dataset.date = article.date;
        listItem.dataset.popularity = article.popularity;
        listItem.dataset.relevance = article.relevance;
        listItem.innerHTML = `
                <a href=${article.website}> <h2 class="title">${article.title}</h2> </a>
                <p class="abstract">${article.abstract}</p>
                <p>Published: ${article.date} </p> 
                <p> Popularity: ${article.popularity} </p>
                <p> Relevance: ${article.relevance} </p>
                <button class="save-article button primary">Save Article</button> 
                <br>
                Feedback:
                <button class="positive-feedback">👍</button>
                <button class="negative-feedback">👎</button>
            `;
        const saveArticleButton = listItem.querySelector('.save-article');
        listItem.querySelector('.save-article').addEventListener('click', () => {
            storeArticle(article);
            saveArticleButton.classList.remove('primary');
            saveArticleButton.classList.add('secondary');
        });

        listItem.querySelector('.positive-feedback').addEventListener('click', () => {
            recordFeedback(article, 'positive');
        });

        listItem.querySelector('.negative-feedback').addEventListener('click', () => {
            recordFeedback(article, 'negative');
        });

        resultsList.appendChild(listItem);
    });
}


function storeArticle(article) {
    // Retrieve existing articles from local storage
    let storedArticles = JSON.parse(localStorage.getItem('articles')) || [];

    // Check if the article is already stored
    let isArticleStored = storedArticles.some(storedArticle => storedArticle.title === article.title);

    // Store the article only if it's not already stored
    if (!isArticleStored) {
        storedArticles.push(article);
        localStorage.setItem('articles', JSON.stringify(storedArticles));
        console.log('Article stored:', article);
    }
}

function recordFeedback(article, feedbackType) {
    // Retrieve existing feedback from local storage
    let feedback = JSON.parse(localStorage.getItem('feedback')) || {};

    // Check if feedback for the article already exists
    let isFeedbackRecorded = feedback.hasOwnProperty(article.title);

    // Record the feedback only if it's not already recorded or has changed
    if (!isFeedbackRecorded || feedback[article.title] !== feedbackType) {
        feedback[article.title] = feedbackType;
        localStorage.setItem('feedback', JSON.stringify(feedback));
        console.log(`Feedback for article "${article.title}" recorded:`, feedbackType);
    }
}

// Add event listener for the addKeywordButton
addKeywordButton.addEventListener("click", () => {
    addKeyword(keywordInput.value);
});

function addKeyword(keyword) {
    if (keyword.trim() === "") return;

    const keywordItem = document.createElement("span");
    keywordItem.classList.add("keyword");
    keywordItem.classList.add("label");
    keywordItem.classList.add("secondary");
    keywordItem.textContent = keyword;

    const removeIcon = document.createElement("span");
    removeIcon.classList.add("remove-keyword");
    removeIcon.textContent = " ×";

    removeIcon.addEventListener("click", () => {
        keywordItem.remove();
    });

    keywordItem.appendChild(removeIcon);
    keywordsContainer.appendChild(keywordItem);

    keywordInput.value = "";
}

filterDate.addEventListener("change", () => {
    applyFilters("date");
});

filterRelevance.addEventListener("change", () => {
    applyFilters("relevance");
});

filterPopularity.addEventListener("change", () => {
    applyFilters("popularity");
});
function sortArticles(articles, sortBy) {
    console.log(sortBy);
    if (sortBy === 'date-desc') {
        return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
        return articles.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popularity-desc') {
        return articles.sort((a, b) => new Number(b.popularity) - new Number(a.popularity));
    } else if (sortBy === 'popularity-asc') {
        return articles.sort((a, b) => a.popularity - b.popularity);
    } else if (sortBy === 'low') {
        return articles.sort((a, b) => b.relevance - a.relevance);
    } else if (sortBy === 'high') {
        return articles.sort((a, b) => a.relevance - b.relevance);
    } else {
        return articles;
    }
}

function applyFilters(filterType) {
    const sortByDate = filterDate.value;
    const sortByPopularity = filterPopularity.value;
    const sortByRelevance = filterRelevance.value;

    let articles = getArticlesFromDOM();
    let sortBy;

    console.log(filterType);

    switch (filterType) {
        case "relevance":
            sortBy = sortByRelevance === "high" ? "high" : "low";
            break;
        case "date":
            sortBy = sortByDate === "latest" ? "date-desc" : "date-asc";
            break;
        case "popularity":
            sortBy = sortByPopularity === "popular" ? "popularity-desc" : "popularity-asc";
            break;
        default:
            sortBy = null;
    }
    console.log(sortBy);

    if (sortBy) {
        articles = sortArticles(articles, sortBy);
    }

    displaySearchedArticles(articles);
}


function getArticlesFromDOM() {
    const articleElements = document.querySelectorAll(".article");
    const articles = Array.from(articleElements).map(articleElement => {
        const title = articleElement.querySelector(".title").textContent;
        const abstract = articleElement.querySelector(".abstract").textContent;
        const date = articleElement.dataset.date;
        const popularity = parseInt(articleElement.dataset.popularity, 10);
        const relevance = parseFloat(articleElement.dataset.relevance);

        return { title, abstract, date, popularity, relevance };
    });

    return articles;
}

