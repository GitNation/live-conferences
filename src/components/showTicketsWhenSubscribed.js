export function showTicketsWhenSubscribed({ ticketsSectionId = 'tickets', checkoutSectionId = 'checkout' } = {}) {
  console.log(ticketsSectionId, checkoutSectionId);
  if (!ticketsSectionId || !checkoutSectionId) {
    return;
  }

  const linksToCheckoutSection = document.querySelectorAll(`a[href="#${checkoutSectionId}"]`);
  const secCheckout = document.querySelector(`#${checkoutSectionId}`);
  const secTickets = document.querySelector(`#${ticketsSectionId}`);
  const secCheckoutForm = document.getElementById('checkout-form');
  const errorMessageNode = document.querySelector('.error-message');

  const update = () => {
    if (localStorage.getItem('pricesShow') === 'true') {
      secCheckout.classList.add('tickets-is-hidden');
      secTickets.classList.remove('tickets-is-hidden');

      linksToCheckoutSection.forEach((link) => {
        link.href = `#${ticketsSectionId}`;
      });
    } else {
      secCheckout.classList.remove('tickets-is-hidden');
      secTickets.classList.add('tickets-is-hidden');
    }
  };

  update();

  function checkoutSendEmail(event) {
    event.preventDefault();

    const sendEmail = window.mailchimpIntegration && window.mailchimpIntegration.subscribe;
    const formData = new FormData(event.target);

    if (!formData.get('email')) {
      alert('Email is required');
      return;
    }

    const email = formData.get('email');

    sendEmail &&
      sendEmail({ email }).then((result) => {
        const isMemberExistsError = result.hasError && result.data && result.data.title === 'Member Exists';

        if (result.hasError && !isMemberExistsError) {
          if (!errorMessageNode) return;

          if (result.error) {
            errorMessageNode.textContent = result.error;
          } else {
            errorMessageNode.textContent = 'Something went wrong. Please try again later.';
          }

          errorMessageNode.classList.remove('is-hidden');
        } else {
          localStorage.setItem('pricesShow', true);

          update();
        }
      });
  }

  secCheckoutForm.addEventListener('submit', checkoutSendEmail);
}
