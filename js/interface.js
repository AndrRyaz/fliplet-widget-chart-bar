var data = Fliplet.Widget.getData() || {
  show_data_legend: true,
  show_data_values: true,
  y_axis_title: '',
  x_axis_title: '',
  show_total_entries: '',
  auto_refresh: ''
};

var $dataSource = $('select#select-data-source');
var $dataColumns = $('select#select-data-column');
var $dataSortOrder = $('select#select-data-sort-order');
var organizationId = Fliplet.Env.get('organizationId');
var initialised = false;

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  if (!initialised) return Fliplet.Widget.complete();

  Fliplet.Widget.save({
    dataSourceId: parseInt($dataSource.val(), 10),
    dataSourceColumn: $dataColumns.val(),
    dataSortOrder: $dataSortOrder.find(':selected').val(),
    show_data_legend: $('#show_data_legend:checked').val() === "show",
    show_data_values: $('#show_data_values:checked').val() === "show",
    y_axis_title: $('#yaxis_title').val(),
    x_axis_title: $('#xaxis_title').val(),
    show_total_entries: $('#show_total_entries:checked').val() === "show",
    auto_refresh: $('#auto_refresh:checked').val() === "refresh"
  }).then(function () {
    Fliplet.Widget.complete();
  });
});

// GET DATA SOURCES, EXCLUDE MENUS, GET ALL THE ROWS
Fliplet.DataSources.get({
  organizationId: organizationId
}).then(function (dataSources) {
  data.dataSources = dataSources;
  var templateSource = $('template[name="dataSourceTemplate"]').html();
  var template = Handlebars.compile(templateSource);
  $dataSource.html(template(dataSources));

  // LOADS DATA SOURCE DATA
  // NEEDS TO BE DONE HERE BECAUSE THE SELECT BOX NEEDS TO BE DYNAMIC UPDATED
  if (data.dataSourceId) {
    $dataSource.val(data.dataSourceId).trigger('change');
    showColumnSelect();
    $dataSortOrder.val(data.dataSortOrder);
    $dataSortOrder.trigger('change');
  } else {
    $dataSource.trigger('change');
  }
  if ( data.dataSourceId && data.dataSourceColumn ) {
    $dataColumns.val(data.dataSourceColumn).trigger('change');
  }

  initialised = true;
});

// LOAD CHART SETTINGS
if (data) {
  $('#show_data_legend').prop('checked', data.show_data_legend);
  $('#show_data_values').prop('checked', data.show_data_values);
  $('#yaxis_title').val(data.y_axis_title);
  $('#xaxis_title').val(data.x_axis_title);
  $('#show_total_entries').prop('checked', data.show_total_entries);
  $('#auto_refresh').prop('checked', data.auto_refresh);
}


// ATTACH LISTENERS
$dataSource.on('change', function(){
  var selectedValue = $(this).val();
  var selectedText = $(this).find("option:selected").text();

  var templateSource = $('template[name="dataColumnTemplate"]').html();
  var template = Handlebars.compile(templateSource);

  var dataSource = _.find(data.dataSources, {id: parseInt(selectedValue,10)});
  if (typeof dataSource !== 'undefined') {
    $dataColumns.html(template(dataSource.columns));
    showColumnSelect();
  }

  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
  checkDataIsConfigured();
});

$dataColumns.on('change', function() {
  var selectedText = $(this).find("option:selected").text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
  checkDataIsConfigured();
});

$dataSortOrder.on('change', function(){
  var selectedText = $(this).find("option:selected").text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});

// FUNCTIONS
function showColumnSelect() {
  if ($dataSource.val() !== 'none') {
    $('.select-data-column').removeClass('hidden');
  } else {
    $('.select-data-column').addClass('hidden');
  }
}

function checkDataIsConfigured() {
  if ($dataSource.val() !== '' && $dataColumns.val() !== '') {
    $('#chart-settings').removeClass('hidden');
  } else {
    $('#chart-settings').addClass('hidden');
  }
}