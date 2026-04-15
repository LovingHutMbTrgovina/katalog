const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");
const template = document.getElementById("productCardTemplate");
const languageToggle = document.getElementById("languageToggle");
const languageMenu = document.getElementById("languageMenu");
const currentLanguageFlag = document.getElementById("currentLanguageFlag");
const currentLanguageLabel = document.getElementById("currentLanguageLabel");

let allProducts = [];
let baseProducts = [];

const translations = {
    sl: {
        eyebrow: "LOVING HUT",
        title: "Katalog izdelkov",
        ingredients: "Sestavine",
        nutrition: "Hranilne vrednosti",
        contains: "Vsebuje",
        mayContain: "Lahko vsebuje sledi",
        searchPlaceholder: "Išči po imenu ali kodi…",
        per: "na",
        productsShown: "prikazanih izdelkov",
        noResults: "Ni najdenih izdelkov",
        moreInfo: "Več informacij",
        lessInfo: "Manj informacij",
        soldOut: "Razprodano",
        missingIngredients: "Sestavine še niso na voljo.",
        nutritionLabels: {
            energy_kj: "Energijska vrednost (kJ)",
            energy_kcal: "Energijska vrednost (kcal)",
            fat_g: "Maščobe",
            saturated_fat_g: "od tega nasičene maščobe",
            carbohydrates_g: "Ogljikovi hidrati",
            sugars_g: "od tega sladkorji",
            fibre_g: "Prehranske vlaknine",
            protein_g: "Beljakovine",
            salt_g: "Sol"
        }
    },
    en: {
        eyebrow: "LOVING HUT",
        title: "Product Catalog",
        ingredients: "Ingredients",
        nutrition: "Nutrition facts",
        contains: "Contains",
        mayContain: "May contain traces of",
        searchPlaceholder: "Search by name or code…",
        per: "per",
        productsShown: "products shown",
        noResults: "No products match your search.",
        moreInfo: "More information",
        lessInfo: "Less information",
        soldOut: "Sold out",
        missingIngredients: "Ingredients not available yet.",
        nutritionLabels: {
            energy_kj: "Energy (kJ)",
            energy_kcal: "Energy (kcal)",
            fat_g: "Fat",
            saturated_fat_g: "of which saturated fat",
            carbohydrates_g: "Carbohydrates",
            sugars_g: "of which sugars",
            fibre_g: "Fibre",
            protein_g: "Protein",
            salt_g: "Salt"
        }
    },
    de: {
        eyebrow: "LOVING HUT",
        title: "Produktkatalog",
        ingredients: "Zutaten",
        nutrition: "Nährwerte",
        contains: "Enthält",
        mayContain: "Kann enthalten",
        searchPlaceholder: "Nach Name oder Code suchen…",
        per: "pro",
        productsShown: "angezeigte Produkte",
        noResults: "Keine passenden Produkte gefunden",
        moreInfo: "Mehr Informationen",
        lessInfo: "Weniger Informationen",
        soldOut: "Ausverkauft",
        missingIngredients: "Zutaten sind noch nicht verfügbar.",
        nutritionLabels: {
            energy_kj: "Energie (kJ)",
            energy_kcal: "Energie (kcal)",
            fat_g: "Fett",
            saturated_fat_g: "davon gesättigte Fettsäuren",
            carbohydrates_g: "Kohlenhydrate",
            sugars_g: "davon Zucker",
            fibre_g: "Ballaststoffe",
            protein_g: "Eiweiß",
            salt_g: "Salz"
        }
    }
};

let currentLang = localStorage.getItem("lang") || "sl";

function formatPrice(value, currency = "EUR") {
    return new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatNutritionValue(key, value) {
    if (key === "energy_kj" || key === "energy_kcal") return String(value);
    return `${value} g`;
}

function createNutritionRows(product) {
    const tbody = document.createElement("tbody");
    const nutrition = product.nutrition || {};

    const labelsByLang =
        translations[currentLang].nutritionLabels || translations.en.nutritionLabels;

    const orderedKeys = [
        "energy_kj",
        "energy_kcal",
        "fat_g",
        "saturated_fat_g",
        "carbohydrates_g",
        "sugars_g",
        "fibre_g",
        "protein_g",
        "salt_g"
    ];

    const availableKeys = orderedKeys.filter(key => nutrition[key] !== undefined);

    if (availableKeys.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="2">/</td>`;
        tbody.appendChild(row);
        return tbody;
    }

    availableKeys.forEach(key => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${labelsByLang[key]}</td>
      <td>${formatNutritionValue(key, nutrition[key])}</td>
    `;
        tbody.appendChild(row);
    });

    return tbody;
}

function buildCard(product, index) {
    const fragment = template.content.cloneNode(true);
    const image = fragment.querySelector(".product-card__image");
    const fallback = fragment.querySelector(".image-fallback");
    const badgeContainer = fragment.querySelector(".badge-container");

    if (product.badges?.includes("gluten_free")) {
        const badge = document.createElement("img");
        badge.src = "images/glutenfree_icon.jpg";
        badge.alt = "Gluten-free";
        badge.className = "product-badge";
        badgeContainer.appendChild(badge);
    }

    const details = fragment.querySelector('[data-role="details"]');
    const toggleButton = fragment.querySelector('[data-role="toggleDetails"]');

    toggleButton.textContent = translations[currentLang].moreInfo;

    if (window.innerWidth > 780) {
        details.hidden = false;
        toggleButton.hidden = true;
    } else {
        details.hidden = true;
        toggleButton.hidden = false;
        toggleButton.setAttribute("aria-expanded", "false");

        toggleButton.addEventListener("click", () => {
            const isHidden = details.hidden;
            details.hidden = !isHidden;
            toggleButton.setAttribute("aria-expanded", String(isHidden));
            toggleButton.textContent = isHidden
                ? translations[currentLang].lessInfo
                : translations[currentLang].moreInfo;
        });
    }

    const ingredientsHeading = fragment.querySelector('[data-i18n="ingredients"]');
    if (ingredientsHeading) {
        ingredientsHeading.textContent = translations[currentLang].ingredients;
    }

    const nutritionHeading = fragment.querySelector('[data-i18n="nutrition"]');
    if (nutritionHeading) {
        nutritionHeading.textContent = translations[currentLang].nutrition;
    }

    fragment.querySelector(".product-card__code").textContent = `${product.id}. (${product.code})`;
    fragment.querySelector(".product-card__title").textContent = product.name;

    const soldOutBadge = fragment.querySelector('[data-role="soldOutBadge"]');

    if (product.available === false) {
        soldOutBadge.hidden = false;
        soldOutBadge.textContent = translations[currentLang].soldOut;
    } else {
        soldOutBadge.hidden = true;
    }

    fragment.querySelector(".product-card__price").textContent = formatPrice(product.price, product.currency || "EUR");
    fragment.querySelector(".product-card__weight").textContent = product.weight || "";
    fragment.querySelector(".ingredients").textContent =
        product.ingredients || translations[currentLang].missingIngredients;
    fragment.querySelector(".per-label").textContent = product.nutrition_per ? `(${translations[currentLang].per} ${product.nutrition_per})` : "";


    const containsTag = fragment.querySelector('[data-role="contains"]');
    containsTag.hidden = false;
    containsTag.textContent = product.contains_allergens?.length
        ? `${translations[currentLang].contains}: ${product.contains_allergens.join(", ")}`
        : `${translations[currentLang].contains}: /`;

    const mayContainTag = fragment.querySelector('[data-role="mayContain"]');
    mayContainTag.hidden = false;
    mayContainTag.textContent = product.may_contain?.length
        ? `${translations[currentLang].mayContain}: ${product.may_contain.join(", ")}`
        : `${translations[currentLang].mayContain}: /`;

    image.src = product.image;
    image.alt = `${product.name} product image`;
    image.addEventListener("error", () => {
        image.hidden = true;
        fallback.hidden = false;
    });

    const table = fragment.querySelector(".nutrition-table");
    table.replaceChildren(createNutritionRows(product));

    return fragment;
}

function renderProducts(products) {
    productGrid.innerHTML = "";

    if (products.length === 0) {
        productCount.textContent = `0 / ${allProducts.length} ${translations[currentLang].productsShown}`;
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = translations[currentLang].noResults;
        productGrid.appendChild(empty);
        return;
    }

    const frag = document.createDocumentFragment();
    products.forEach((product, index) => {
        frag.appendChild(buildCard(product, index));
    });
    productGrid.appendChild(frag);

    productCount.textContent = `${products.length} / ${allProducts.length} ${translations[currentLang].productsShown}`;
}

function filterProducts(query) {
    const q = query.trim().toLowerCase();
    if (!q) return allProducts;

    return allProducts.filter(product => {
        return [
            product.code,
            product.name,
            product.weight,
            product.ingredients
        ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(q));
    });
}

async function init() {
    try {
        applyTranslations();
        updateLanguageButton();

        const sharedResponse = await fetch("products.json");
        const sharedData = await sharedResponse.json();
        baseProducts = sharedData.products || [];

        const translatedResponse = await fetch(`products_${currentLang}.json`);
        const translatedData = await translatedResponse.json();

        allProducts = mergeProducts(baseProducts, translatedData.products || []);
        renderProducts(allProducts);
    } catch (error) {
        productGrid.innerHTML = '<div class="empty-state">Could not load product data.</div>';
        productCount.textContent = "Failed to load products";
        console.error(error);
    }
}

searchInput.addEventListener("input", event => {
    renderProducts(filterProducts(event.target.value));
});

function applyTranslations() {
    const dict = translations[currentLang];

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });
}

function updateLanguageButton() {
    const labels = {
        sl: {flag: "images/translation/si.svg", label: "SL", name: "Slovenščina"},
        en: {flag: "images/translation/gb.svg", label: "EN", name: "English"},
        de: {flag: "images/translation/de.svg", label: "DE", name: "Deutsch"}
    };

    currentLanguageFlag.src = labels[currentLang].flag;
    currentLanguageFlag.alt = labels[currentLang].name;
    currentLanguageLabel.textContent = labels[currentLang].label;
}

function mergeProducts(sharedProducts, translatedProducts) {
    const translatedMap = new Map(
        translatedProducts.map(product => [product.code, product])
    );

    return sharedProducts.map(sharedProduct => {
        const translated = translatedMap.get(sharedProduct.code) || {};

        return {
            ...sharedProduct,
            name: translated.name || "",
            ingredients: translated.ingredients || "",
            contains_allergens: translated.contains_allergens || [],
            may_contain: translated.may_contain || []
        };
    });
}

async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslations();
    updateLanguageButton();

    try {
        const response = await fetch(`products_${currentLang}.json`);
        const translatedData = await response.json();

        allProducts = mergeProducts(baseProducts, translatedData.products || []);
        renderProducts(filterProducts(searchInput.value));
    } catch (error) {
        console.error(error);
    }
}

languageToggle.addEventListener("click", () => {
    const isHidden = languageMenu.hasAttribute("hidden");

    if (isHidden) {
        languageMenu.removeAttribute("hidden");
        languageToggle.setAttribute("aria-expanded", "true");
    } else {
        languageMenu.setAttribute("hidden", "");
        languageToggle.setAttribute("aria-expanded", "false");
    }
});

document.querySelectorAll(".language-option").forEach(button => {
    button.addEventListener("click", () => {
        setLanguage(button.dataset.lang);
        languageMenu.setAttribute("hidden", "");
        languageToggle.setAttribute("aria-expanded", "false");
    });
});

document.addEventListener("click", event => {
    if (!event.target.closest(".language-dropdown")) {
        languageMenu.setAttribute("hidden", "");
        languageToggle.setAttribute("aria-expanded", "false");
    }
});

init();
