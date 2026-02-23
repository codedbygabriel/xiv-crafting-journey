function initialize() {
	const searchState = {
		pointer : false,
		oldPointer : false,
		item : false,
		paging: false
	}

	const body = document.querySelector('body');
	const searchBar = document.querySelector("#item-name");

	body.addEventListener('keydown', e => {
		switch(e.key){
			case 'l':
				searchBarEvent(searchState);
				break;
			case 'h':
				console.warn("WIP");
				break;
		}
	}) 

	searchBar.addEventListener('keydown', event => {
		if (event.key === 'Enter'){
			searchState.item = searchBar.value.toLowerCase();
			searchBarEvent(searchState);
		}
	})
}

async function searchBarEvent(searchState) {

	const possibleItem = searchState.item;	
	let ITEM_SEARCH_URL = !searchState.pointer
	? `https://v2.xivapi.com/api/search?sheets=Item&query=Name~"${possibleItem}"&limit=10`
	: `https://v2.xivapi.com/api/search?cursor=${searchState.pointer}&limit=10`

	const _fetchItemResponse = await fetch(ITEM_SEARCH_URL);
	if(!_fetchItemResponse.ok) return false;

	const fetchItemResponse = await _fetchItemResponse.json();

	if(searchState.paging && !fetchItemResponse.next){
		console.warn('SHOULD END')
	}

	searchState.pointer = fetchItemResponse.next || false;
	searchState.paging = true;

	console.warn("new pointer:", searchState.pointer);
}

(function(){
	initialize();
})();
