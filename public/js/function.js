$(function() {

	let global_config = {
		prev_next_index: 1,
		default_page_index: 0,
		number_of_records_per_page: 5, // '5' is standard practice.
		api_url: 'public/api/airports-short.json',
	}

	// Update Default Number Of Record Set Text.
	$('.curovral__count').text(global_config.number_of_records_per_page);

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

	let call_api_data = async () => {
		try {
			let resp = await fetch(global_config.api_url)
			let data = await resp.json();
			generate_table(global_config.default_page_index, global_config.number_of_records_per_page, global_config.prev_next_index, data);
		} catch (error) {
			console.log(error);
		}
	}

	call_api_data();

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
		// console.log(limit);
	}

	function generate_table(pdi, resultsPerPage, pni, data){

		let offset=pdi*resultsPerPage;//page 2=10, page 3=20;
		let limit=offset+resultsPerPage;
		let table = $('.js-result-container');
		let table_html;
		

		function numPages() {
			return Math.ceil(data.length / resultsPerPage);
		}

		function updatePage(pg) {
			if (pg < 1) pg = 1;
			if (pg > numPages()) pg = numPages();
			if (data.length > 0) {
				for (var i = (pg-1) * resultsPerPage; i < (pg * resultsPerPage); i++) {
					let prev = ((i + 1) - resultsPerPage) !== 0 ?  ((i + 1) - resultsPerPage) + 1 : 1;
					// $('.current__count').text(`${prev} - ${i + 1}`);
					$('.current__count').text(`${prev}`);
				}
			} else {
				$('.current__count').text('1');
			}
		}

		// loop through data
		for (var i= offset; i < limit; i++){
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