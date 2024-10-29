export function showTicketsWhenSubscribed({ ticketsSectionId = 'tickets' } = {}) {
  if (!ticketsSectionId) {
    return;
  }

  const secTickets = document.querySelector(`#${ticketsSectionId}`);
  if (!secTickets) {
    return;
  }

  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get('email');
  if (email) {
    const checkIfEmailIsAlreadySubscribed = window.mailchimpIntegration && window.mailchimpIntegration.checkIfEmailIsAlreadySubscribed;
    checkIfEmailIsAlreadySubscribed &&
      checkIfEmailIsAlreadySubscribed({ email }).then((result) => {
        console.log(result);

        if (result.hasError) {
          console.log(result.error);
          return;
        }

        if (result.data.isExists) {
          localStorage.setItem('pricesShow', 'true');
        }
      });
  }

  const secCheckoutForm = document.getElementById('checkout-form');
  const errorMessageNode = document.querySelector('.error-message');

  const update = () => {
    if (localStorage.getItem('pricesShow') === 'true') {
      secTickets.classList.remove('tickets-is-hidden');
    } else {
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
          localStorage.setItem('pricesShow', 'true');

          update();
        }
      });
  }

  if (secCheckoutForm) secCheckoutForm.addEventListener('submit', checkoutSendEmail);
}
