/* Page Height & Width
 * -------------------------------------------------- */
function appHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
  document.documentElement.style.setProperty('--app-width', `${window.innerWidth}px`)
}
window.addEventListener('resize', appHeight);
appHeight();

/* Datatable actions
 * -------------------------------------------------- */
$(document).ready(function () {
  checkAndUpdateTableActions();

  $('input[data-table-checkbox]').on('change', function () {
    updateTableActions($(this));
  });

  function updateTableActions(checkbox) {
    const container = checkbox.closest('.table');
    const anyCheckboxChecked = container.find('input[data-table-checkbox]:checked').length > 0;
    container.find('.table-actions').toggleClass('active', anyCheckboxChecked);
  }

  function checkAndUpdateTableActions() {
    $('input[data-table-checkbox]').each(function () {
      updateTableActions($(this));
    });
  }
});

$(".table-dropdown__toggle").each(function() {
  new bootstrap.Dropdown($(this), {
    popperConfig: {
      strategy: "fixed"
    }
  });
});

/* License Banner
 * -------------------------------------------------- */
$(document).on('click', '[data-license-banner-close]', function () {
  $('.license-banner').addClass('hide')
})