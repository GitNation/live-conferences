function formatDate(dateString) {
  const dateParts = dateString.split('-'); // Разделяем строку на части
  const month = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleString('en-US', { month: 'long' });
  const day = dateParts[2];

  return `${month} ${day}`;
}

if (document.querySelectorAll('.js-format-date')) {
  document.querySelectorAll('.js-format-date').forEach((element) => {
    const dateValue = element.getAttribute('data-date');

    if (dateValue) {
      const formattedDate = formatDate(dateValue);
      element.textContent = formattedDate;
    }
  });
}
