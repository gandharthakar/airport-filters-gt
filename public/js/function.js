$(function() {

	let global_config = {
		prev_next_index: 1,
		default_page_index: 0,
		number_of_records_per_page: 5, // '5' is standard practice.
		api_url: 'public/api/airports-short.json',
	}

	let key_offline_data = 'offline_orignal_data';
	let key_offline_fdata = 'offline_filtered_data';
	let key_applied_filters = 'applied_filters';

	let applied_filters = [];
	let global_filter_result = [];

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

	// Update Default Number Of Record Set Text.
	$('.curovral__count').text(global_config.number_of_records_per_page);

	// Check If Records Per Page Will Match With Data Length.
	function check_record_limit_with_data_length(data) {
		let next_btn = $('.js-show-nextpage');
		let prev_btn = $('.js-show-prevpage');
		if(data.length == global_config.number_of_records_per_page) {
			next_btn.attr('disabled', true);
			prev_btn.attr('disabled', true);
		}
	}

	// Mobile Filter Toggle.
    $('.js-toggle-filters').on('click', function(){
		let filter_container = $('.js-mob-filters');
		let isActive = $(this).hasClass('active');
		if(!isActive) {
			$(this).addClass('active');
			filter_container.addClass('active');
		} else {
			$(this).removeClass('active');
			filter_container.removeClass('active');
		}
	});

	let request_data = async  () => {
		try {
			let resp = await fetch(global_config.api_url)
			let data = await resp.json();
			generate_table(global_config.default_page_index, global_config.number_of_records_per_page, global_config.prev_next_index, data);
			check_record_limit_with_data_length(data);
			localStorage.setItem(key_offline_data, JSON.stringify(data));
		} catch (error) {
			console.log(error);
		}
	}

	// On Page Load Call Data.
	let call_api_data = () => {
		let offline_data = localStorage.getItem(key_offline_data);
		if(!offline_data) {
			console.log('going in if not offline data found!');
			request_data();
		} else {
			console.log('going in else offline data found!');
			let offline_filter_data = localStorage.getItem(key_offline_fdata);
			if(!offline_filter_data) {
				console.log('going in if not filtered offline data found!');
				if(!offline_data) {
					console.log('going in if not filtered offline data found Then requesting offline data.');
					request_data();
				} else {
					console.log('going in if not filtered offline data found Then using offline data if available.');
					let ofp_data = JSON.parse(offline_data);
					generate_table(global_config.default_page_index, global_config.number_of_records_per_page, global_config.prev_next_index, ofp_data);
					check_record_limit_with_data_length(ofp_data);
				}
			} else {
				console.log('going in else offline filtered data found!');
				let pdata = JSON.parse(offline_filter_data);
				generate_table(global_config.default_page_index, global_config.number_of_records_per_page, global_config.prev_next_index, pdata);
				check_record_limit_with_data_length(pdata);
			}
		}
	}

	call_api_data();

	// Filter By Type.
	let all_type_cb = document.querySelectorAll('.js-type-cb');
	for(let i = 0; i < all_type_cb.length; i++) {
		$(all_type_cb[i]).on('change', function(){
			let table = $('.js-result-container');
			if (this.checked == true){
				let data = JSON.parse(localStorage.getItem(key_offline_data));
				for(let a = 0; a < data.length; a++) {
					if(data[a].type === this.value) {
						global_filter_result.push(data[a]);
						shuffleArray(global_filter_result);
					}
				}
				applied_filters.push(this.value);
			} else {
				// Remove filtered data.
				let toRemove_data = [`${this.value}`];
				global_filter_result = global_filter_result.filter((item) => !toRemove_data.includes(item.type));
				// Remove filter items.
				let toRemove_filters = [`${this.value}`];
				applied_filters = applied_filters.filter((item) => !toRemove_filters.includes(item));
			}
			if(global_filter_result.length > 0) {
				table.empty();
				generate_table(global_config.default_page_index, global_config.number_of_records_per_page, global_config.prev_next_index, global_filter_result);
				check_record_limit_with_data_length(global_filter_result);
				localStorage.setItem(key_offline_fdata, JSON.stringify(global_filter_result));
			} else {
				localStorage.removeItem(key_offline_fdata);
				let off_data = localStorage.getItem(key_offline_data);
				let parse_off_data = JSON.parse(off_data);
				table.empty();
				generate_table(global_config.default_page_index, global_config.number_of_records_per_page, global_config.prev_next_index, parse_off_data);
				check_record_limit_with_data_length(parse_off_data);
			}
			if(applied_filters.length > 0) {
				localStorage.setItem(key_applied_filters, JSON.stringify(applied_filters));
			} else {
				localStorage.removeItem(key_applied_filters);
			}
		});
	}

	function check_applied_filters() {
		let offafk = localStorage.getItem(key_applied_filters);
		let all_cb = $('.js-type-cb');
		if(offafk) {
			let parsed_offafk = JSON.parse(offafk);
			for(let i = 0; i < parsed_offafk.length; i++) {
				applied_filters.push(parsed_offafk[i]);
				for(let x = 0; x < all_cb.length; x++) {
					if($(all_cb[x]).val() == parsed_offafk[i]) {
						$(all_cb[x]).prop('checked', true);
					}
				}
			}
		}
		let offafdt = localStorage.getItem(key_offline_fdata);
		if(offafdt) {
			let parsed_offafdt = JSON.parse(offafdt);
			for(let i = 0; i < parsed_offafdt.length; i++) {
				global_filter_result.push(parsed_offafdt[i]);
			}
		}
	}

	check_applied_filters();

	function sub_update_table(pdi, resultsPerPage, offset, limit, data) {
		offset = pdi*resultsPerPage;
		limit = offset+resultsPerPage;
		let table = $('.js-result-container');
		let table_html;
		
		let next_btn = $('.js-show-nextpage');
		let prev_btn = $('.js-show-prevpage');
		if(limit == data.length) {
			next_btn.attr('disabled', true);
		} else {
			next_btn.removeAttr('disabled');
		}
		if(limit == resultsPerPage) {
			prev_btn.attr('disabled', true);
		} else {
			prev_btn.removeAttr('disabled');
		}

		table.empty();
		for (var i= offset; i < limit; i++){
			if(data[i]) {
				table_html = `<tr>
				<td>${data[i].id}</td>
				<td>${data[i].name}</td>
				<td>${data[i].icao}</td>
				<td>${data[i].iata}</td>
				<td>${data[i].elevation}</td>
				<td>${data[i].latitude}</td>
				<td>${data[i].longitude}</td>
				<td>${data[i].type}</td>
				</tr>`;
				table.append(table_html);
				$('.curovral__count').text(limit);
			} else {
				let diff = limit - data.length;
				$('.curovral__count').text(limit - diff);
				if(diff) {
					next_btn.attr('disabled', true);
				} else {
					next_btn.removeAttr('disabled');
				}
			}
		}
	}

	function generate_table(pdi, resultsPerPage, pni, data){

		let offset=pdi*resultsPerPage;//page 2=10, page 3=20;
		let limit=offset+resultsPerPage;
		let table = $('.js-result-container');
		let table_html;
		let next_btn = $('.js-show-nextpage');
		let prev_btn = $('.js-show-prevpage');

		function numPages() {
			return Math.ceil(data.length / resultsPerPage);
		}

		function updatePage(pg) {
			if (pg < 1) pg = 1;
			if (pg > numPages()) pg = numPages();
			if (data.length > 0) {
				for (var i = (pg-1) * resultsPerPage; i < (pg * resultsPerPage); i++) {
					let prev = ((i + 1) - resultsPerPage) !== 0 ?  ((i + 1) - resultsPerPage) + 1 : 1;
					$('.current__count').text(`${prev}`);
				}
			} else {
				$('.current__count').text('1');
			}
		}

		// loop through data
		for (var i= offset; i < limit; i++){
			if(data[i]) {
				table_html = `<tr>
				<td>${data[i].id}</td>
				<td>${data[i].name}</td>
				<td>${data[i].icao}</td>
				<td>${data[i].iata}</td>
				<td>${data[i].elevation}</td>
				<td>${data[i].latitude}</td>
				<td>${data[i].longitude}</td>
				<td>${data[i].type}</td>
				</tr>`;
				table.append(table_html);
			}
		}

		if(data.length == 0) {
			table_html = `<tr><td colspan="8" class="text-center">Data Not Found</td></tr>`;
			table.append(table_html);
		}

		// Check Whether Data length is less than limit.
		if(data.length < limit) {
			$('.curovral__count').text(data.length);
			next_btn.attr('disabled', true);
			prev_btn.attr('disabled', true);
		} else {
			$('.curovral__count').text(limit);
			next_btn.removeAttr('disabled');
		}

		function next_record() {
			pdi = pdi + 1;
			if((pdi*resultsPerPage) > data.length){
				pdi = pdi - 1;
			}
			sub_update_table(pdi, resultsPerPage, offset, limit, data);
			if (pni < numPages()) {
				pni++;
				updatePage(pni);
			}
		}

		function prev_record() {
			pdi = pdi - 1;
			if(pdi < 0){
				pdi = pdi + 1;
			}
			sub_update_table(pdi, resultsPerPage, offset, limit, data);
			if (pni > 1) {
				pni--;
				updatePage(pni);
			}
		}

		$('.total__count').text(data.length);
		$('body').on('click', '.js-show-nextpage', next_record);
		$('body').on('click', '.js-show-prevpage', prev_record);
	}

});