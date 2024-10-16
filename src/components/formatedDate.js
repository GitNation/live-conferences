function formatDate(dateString, timeZone = 'UTC') {
  const date = new Date(dateString);

  if (isNaN(date)) {
    console.error('Invalid date:', dateString);
    return dateString;
  }

  const options = {
    month: 'long',
    day: 'numeric',
    timeZone,
  };

  return date.toLocaleDateString('en-US', options);
}

if (document.querySelectorAll('.js-format-date')) {
  document.querySelectorAll('.js-format-date').forEach((element) => {
    const dateValue = element.getAttribute('data-date');
    const timeZone = element.getAttribute('data-timezone') || 'UTC'; // Default to UTC if no timezone is provided

    if (dateValue) {
      const formattedDate = formatDate(dateValue, timeZone);
      element.textContent = formattedDate;
    }
  });
}
