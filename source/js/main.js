function initialize() {
	const searchState = {
		pointer : false,
		oldPointer : false,
		item : false,
		paging: false
	}

	const body = document.querySelector('body');
	const searchBar = document.querySelector("#item-name");
	const loadMoreItems = document.querySelector('.load-more-items');
	const clearItems = document.querySelector('.clear-items');
	
	loadMoreItems.addEventListener('click', e =>{
		searchBarEvent(searchState, loadMoreItems, clearItems)
	});

	clearItems.addEventListener('click', e => {
		clearSearch(searchState, loadMoreItems, true);
	})

	searchBar.addEventListener('keydown', event => {
		const input = searchBar.value.toLowerCase().trim();
		if (event.key === 'Enter' && input){
			searchState.item = input;
			searchBarEvent(searchState, loadMoreItems, clearItems);
		}
	})
}

async function searchBarBackwards(searchState) {}
async function searchBarEvent(searchState, loadMore, clearItems) {
	if(!searchState.item) return false;

	let ITEM_SEARCH_URL = !searchState.pointer
	? `https://v2.xivapi.com/api/search?sheets=Item&query=Name~"${searchState.item}"&limit=10`
	: `https://v2.xivapi.com/api/search?cursor=${searchState.pointer}&limit=10`

	const _fetchItemResponse = await fetch(ITEM_SEARCH_URL);
	if(!_fetchItemResponse.ok) return false;

	const fetchItemResponse = await _fetchItemResponse.json();
	paintItemsOnScreen(fetchItemResponse);

	searchState.pointer = fetchItemResponse.next || false;
	searchState.oldPointer = searchState.pointer;
	searchState.paging = true;

	// If there's no pointer, it'll fall on this condition
	if(!searchState.pointer) {
		clearSearch(searchState, loadMore);
		return false;
		// searchState.item = false;
		// searchState.paging = false;
		// document.querySelector("#item-name").value = '';
		// loadMore.classList.add('load-more-items-hidden');
	}

	// Else, if there's a pointer tho...
	loadMore.classList.remove('load-more-items-hidden');
	clearItems.classList.remove('clear-items-hidden');
}

function paintItemsOnScreen(items) {
	if (!items.results.length > 0) 
		return false;

	const pagination = document.createElement("section");
	const hr = document.createElement("hr");
	
	items.results.forEach(item => {
		const itemSection = document.createElement("article");
		const itemName = document.createElement("span");
		const itemID = document.createElement("span");

		itemName.textContent = `ITEM = ${item.fields.Name}\t` 
		itemID.textContent = `ID = ${item.row_id}` 

		itemSection.appendChild(itemName);
		itemSection.appendChild(itemID);

		pagination.appendChild(itemSection);
	})

	document.querySelector('.items-container').appendChild(hr);
	document.querySelector('.items-container').appendChild(pagination);
	pagination.scrollIntoView({behavior: 'smooth'});
}

function clearSearch(searchState, loadMore, clearItems = false) {
	if (clearItems) {
		document.querySelector('.items-container').innerHTML = '';
		document.querySelector('.clear-items').classList.add('clear-items-hidden');
	}
	

	document.querySelector("#item-name").value = '';
	searchState.item = false;
	searchState.paging = false;
	loadMore.classList.add('load-more-items-hidden');
}

(function(){
	initialize();
})();
