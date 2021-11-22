let apiURL = 'public/api/airports.json';

const __config = {
    current_result_page: 1,
    result_per_page: 4
}

let global_filter_result = [];
let global_search_result = [];
let applied_filters = [];

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		// Generate random number
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
	}
	return array;
 }

// Toggle Mobile Filters.
const mobi_filter_button = document.querySelector('.js-toggle-filters');
const filter_container = document.querySelector('.js-mob-filters');
mobi_filter_button.addEventListener('click', function() {
    let isActive = this.classList.contains('active');
    if(!isActive) {
        this.classList.add('active');
        filter_container.classList.add('active');
    } else {
        this.classList.remove('active');
        filter_container.classList.remove('active');
    }
});


const getData = async () => {
	let offline_data = localStorage.getItem('offline_airport_data');
	if(!offline_data) {
		// Request Online Data.
		try {
			let response = await fetch(apiURL);
			let data = await response.json();
			render_table(data);
			localStorage.setItem('offline_airport_data', JSON.stringify(data));
		} catch (error) {
			console.log(error);
		}
	} else {
		let off_data = localStorage.getItem('offline_airport_data');
		// If item is already set but with blank state then.
		if(!JSON.parse(off_data).length > 0) {
			// Request Online Data.
			try {
				let response = await fetch(apiURL);
				let data = await response.json();
				render_table(data);
				localStorage.setItem('offline_airport_data', JSON.stringify(data));
			} catch (error) {
				console.log(error);
			}
		} else {
			let parse_off_data = JSON.parse(off_data);
			render_table(parse_off_data);
		}
	}    
}

getData();

// Filter By Type.
let all_type_cb = document.querySelectorAll('.js-type-cb');
for(let i = 0; i < all_type_cb.length; i++) {
	all_type_cb[i].addEventListener('change', function(){
		if (this.checked == true){
			let data = JSON.parse(localStorage.getItem('offline_airport_data'));
			for(let a = 0; a < data.length; a++) {
				if(data[a].type === this.value) {
					global_filter_result.push(data[a]);
					shuffleArray(global_filter_result);
				}
			}
			applied_filters.push(this.value);
		} else {
			// Remove filter data.
			let toRemove_data = [`${this.value}`];
			global_filter_result = global_filter_result.filter((item) => !toRemove_data.includes(item.type));
			// Remove filter items.
			let toRemove_filters = [`${this.value}`];
			applied_filters = applied_filters.filter((item) => !toRemove_filters.includes(item));
		}
		console.log(applied_filters);
		if(global_filter_result.length > 0) {
			render_table(global_filter_result);
		} else {
			let off_data = localStorage.getItem('offline_airport_data');
			let parse_off_data = JSON.parse(off_data);
			render_table(parse_off_data);
		}
	});
}

// Filter By Search.
let search_input = document.querySelector('.js-filt-input');
search_input.addEventListener('keyup', function(){
	let search_query = this.value;
	if(this.value !== '' || this.value.length > 0) {
		let data = JSON.parse(localStorage.getItem('offline_airport_data'));
		for(let a = 0; a < data.length; a++) {
			if((data[a].name == search_query) || 
			(data[a].name.toLowerCase() == search_query.toLowerCase()) || 
			(data[a].name.toUpperCase() == search_query.toUpperCase()) || 
			(data[a].iata == search_query) || 
			(data[a].icao == search_query) || 
			(data[a].altitude == search_query) || 
			(data[a].elevation == search_query)) {
				global_search_result.push(data[a]);
			}
		}
		render_table(global_search_result);
	} else {
		if(global_filter_result.length > 0) {
			render_table(global_filter_result);
		} else {
			global_search_result = [];
			render_table(global_search_result);
		}
	}
});

function render_table(result_data) {

	// Get All Variables.
	let next_btn = document.querySelector(".js-show-nextpage");
	let prev_btn = document.querySelector(".js-show-prevpage");
	let result_table = document.querySelector(".js-result-container");
	let current_result_count = document.querySelector(".current__count");
	let total_number_of_records = document.querySelector(".total__count");

	// Previous / Next Buttons.
	let crp = __config.current_result_page;
	let records_per_page = __config.result_per_page;

	var data = result_data;

	total_number_of_records.innerHTML = data.length;

	function numPages() {
	    return Math.ceil(data.length / records_per_page);
	}

	prev_btn.addEventListener("click", prevPage);
	next_btn.addEventListener("click", nextPage);

	function prevPage(e) {
		e.preventDefault();
	    if (crp > 1) {
	        crp--;
	        updatePage(crp);
	    }
	}

	function nextPage(e) {
		e.preventDefault();
	    if (crp < numPages()) {
	        crp++;
	        updatePage(crp);
	    }
	}

	function updatePage(pg) {
	    if (pg < 1) pg = 1;
	    if (pg > numPages()) pg = numPages();

	    result_table.innerHTML = "";

		if (data.length > 0) {
			for (var i = (pg-1) * records_per_page; i < (pg * records_per_page); i++) {
				result_table.innerHTML += `<tr>
				<td>${data[i].name}</td>
				<td>${data[i].icao}</td>
				<td>${data[i].iata}</td>
				<td>${data[i].elevation}</td>
				<td>${data[i].latitude}</td>
				<td>${data[i].longitude}</td>
				<td>${data[i].type}</td>
				</tr>`;

				current_result_count.innerHTML = `${(i + 1) - 3} - ${i + 1}`;
		   }
		} else {
			result_table.innerHTML += `<tr> <td colspan="7" class="text-center"> Result Not Found.</td> </tr>`
			current_result_count.innerHTML = `${0} - ${0}`;
		}
	}

	updatePage(1);
}