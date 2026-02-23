function initialize() {
	const searchState = {
		pointer : false,
		oldPointer : false,
		item : false,
		paging: false
	}

	const body = document.querySelector('body');
	const searchBar = document.querySelector("#item-name");

	document.querySelector('.right-arrow').addEventListener('click', e =>{
		searchBarEvent(searchState)
	});

	searchBar.addEventListener('keydown', event => {
		const input = searchBar.value.toLowerCase().trim();
		if (event.key === 'Enter' && input){
			searchState.item = input;
			searchBarEvent(searchState);
		}
	})
}

async function searchBarBackwards(searchState) {}
async function searchBarEvent(searchState) {
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

	if(!searchState.pointer) {
		searchState.item = false;
		searchState.paging = false;
		document.querySelector("#item-name").value = '';

		return false;
	}
}

function paintItemsOnScreen(items) {
	console.warn(items.results)
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
}

(function(){
	initialize();
})();
