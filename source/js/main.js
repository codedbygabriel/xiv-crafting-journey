function initialize() {
	const searchState = {
		pointer: false,
		oldPointer: false,
		item: false,
		currentSearch: false,
		paging: false,
	};

	const body = document.querySelector("body");
	const searchBar = document.querySelector("#item-name");
	const loadMoreItems = document.querySelector(".load-more-items");
	const clearItems = document.querySelector(".clear-items");
	const switchPage = document.querySelector(".navbar-switcher");
	const savedItems = [];

	loadMoreItems.addEventListener("click", (event) => {
		searchBarEvent(searchState, loadMoreItems, clearItems);
	});

	clearItems.addEventListener("click", (event) => {
		clearSearch(searchState, loadMoreItems, true);
	});

	searchBar.addEventListener("keydown", (event) => {
		const input = searchBar.value.toLowerCase().trim();
		if (event.key === "Enter" && input) {
			searchState.item = input;
			searchBarEvent(searchState, loadMoreItems, clearItems);
		}
	});

	switchPage.addEventListener("click", (event) => switchPageEvent());
}

function switchPageEvent() {
	const pages = document.querySelectorAll(".page");
	pages.forEach((page) => page.classList.toggle("hidden-page"));
}

async function searchBarEvent(searchState, loadMore, clearItems) {
	if (!searchState.item) return false;
	if (searchState.currentSearch && searchState.item !== searchState.currentSearch) {
		searchState.pointer = false;
		searchState.oldPointer = false;
		searchState.paging = false;
	}

	let ITEM_SEARCH_URL = !searchState.pointer
		? `https://v2.xivapi.com/api/search?sheets=Item&query=Name~"${searchState.item}"&limit=10`
		: `https://v2.xivapi.com/api/search?cursor=${searchState.pointer}&limit=10`;

	const _fetchItemResponse = await fetch(ITEM_SEARCH_URL);
	if (!_fetchItemResponse.ok) return false;

	const fetchItemResponse = await _fetchItemResponse.json();
	paintItemsOnScreen(fetchItemResponse);

	searchState.pointer = fetchItemResponse.next || false;
	searchState.oldPointer = searchState.pointer;
	searchState.paging = true;

	// Adding this up here just so it gets in if it's a single search...
	clearItems.classList.remove("clear-items-hidden");

	// If there's no pointer, it'll fall on this condition
	if (!searchState.pointer) {
		clearSearch(searchState, loadMore);
		return false;
	}

	// Else, if there's a pointer tho...
	loadMore.classList.remove("load-more-items-hidden");

	// Sets currentSearch
	searchState.currentSearch = searchState.item;
}

function clearSearch(searchState, loadMore, clearItems = false) {
	if (clearItems) {
		document.querySelector(".items-container").innerHTML = "";
		document.querySelector(".clear-items").classList.add("clear-items-hidden");
	}

	document.querySelector("#item-name").value = "";
	searchState.item = false;
	searchState.paging = false;
	loadMore.classList.add("load-more-items-hidden");
}

function paintItemsOnScreen(items) {
	if (!items.results.length > 0) return false;

	const pagination = document.createElement("section");
	const hr = document.createElement("hr");

	items.results.forEach((item) => {
		const itemDetails = document.createElement("details");
		const itemName = document.createElement("summary");

		itemName.textContent = `${item.fields.Name} (${item.row_id})`;

		itemDetails.appendChild(itemName);
		pagination.appendChild(itemDetails);

		itemDetails.addEventListener("toggle", (e) => handleRecipeID(item, itemDetails));
	});

	document.querySelector(".items-container").appendChild(hr);
	document.querySelector(".items-container").appendChild(pagination);
	pagination.scrollIntoView({ behavior: "smooth" });
}

async function handleRecipeID(item, section) {
	if (!section.open) return false;
	if (Array.from(section.childNodes).find((el) => el.tagName === "UL")) return false;

	const BASE_URL = `https://v2.xivapi.com/api/search?sheets=Recipe&query=ItemResult=${item.row_id}`;
	const _fetchRecipeID = await fetch(BASE_URL);

	if (!_fetchRecipeID.ok) return false;

	const fetchRecipeID = await _fetchRecipeID.json();

	if (!fetchRecipeID.results.length >= 1) return false;

	const RECIPE_ID = fetchRecipeID.results[0].row_id;
	const recipes = await gatherRecipe(RECIPE_ID);

	// Creating Elements
	const list = document.createElement("ul");
	recipes.forEach((recipe) => {
		const item = document.createElement("li");
		item.textContent = `${recipe.qnt}x\t\t${recipe.ing.fields.Name}`;
		list.append(item);
	});

	// Save button!
	const saveText = document.createElement("li");
	saveText.classList.add("saveText");
	saveText.textContent = "[SAVE]";

	saveText.addEventListener("click", (e) => {
		saveItem(item, recipes);
	});

	list.append(saveText);
	section.append(list);
}

function saveItem(item, recipes) {
	const KEY = "xiv_items";
	const data = JSON.parse(localStorage.getItem(KEY)) || [];

	data.push({ item, recipes });
	const LS_DATA = JSON.stringify(data);

	localStorage.setItem(KEY, LS_DATA);
	return true;
}

function loadItems() {
	const KEY = "xiv_items";
	const data = JSON.parse(localStorage.getItem(KEY)) || [];

	if (data.length <= 0) return false;

	return data;
}

function paintSavedItemsOnScreen(data) {
	if (!(data.length >= 1)) console.warn("LOG = NO ITEMS SAVED AT LOCALSTORAGE, SKIPPING PAINTING PHASE.");

	console.log(data);

	const container = document.querySelector(".saved-items");

	data.forEach((_) => {
		const itemDetails = document.createElement("details");
		const itemName = document.createElement("summary");
		const list = document.createElement("ul");

		itemName.textContent = `${_.item.fields.Name} (${_.item.row_id})`;

		itemDetails.appendChild(itemName);

		itemDetails.addEventListener("toggle", (event) => {
			if(list.childNodes.length >= 1)
				return false;

			_.recipes.forEach((recipe) => {
				const item = document.createElement("li");
				item.textContent = `${recipe.qnt}x\t\t${recipe.ing.fields.Name}`;
				list.append(item);
			});
		});

		itemDetails.appendChild(list);
		container.appendChild(itemDetails);
	});
}

async function gatherRecipe(RECIPE_ID) {
	const SEARCH_COMPONENTS = `https://v2.xivapi.com/api/sheet/Recipe/${RECIPE_ID}?fields=AmountIngredient,Ingredient,CanHq`;
	const _fetchRecipe = await fetch(SEARCH_COMPONENTS);

	if (!_fetchRecipe.ok) return false;

	const recipe = await _fetchRecipe.json();
	const recipeElements = [];

	for (let index = 0; index < recipe.fields.AmountIngredient.length; index++) {
		if (!recipe.fields.AmountIngredient[index] >= 1) continue;

		recipeElements.push({
			qnt: recipe.fields.AmountIngredient[index],
			ing: recipe.fields.Ingredient[index],
		});
	}

	return recipeElements;
}

(function() {
	loadItems();
	initialize();
	paintSavedItemsOnScreen(loadItems());
})();
