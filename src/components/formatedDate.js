function formatDate(dateString) {
  const date = new Date(dateString);

  if (isNaN(date)) {
    console.error('Invalid date:', dateString);
    return dateString;
  }

  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
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
