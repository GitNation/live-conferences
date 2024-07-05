const forms = document.querySelectorAll('.js-subscribtion-form');

// https://mailchimp.com/developer/marketing/api/list-members/add-member-to-list/
forms.forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    if (formData.get('email') === '') {
      alert('Email is required');
      return;
    }

    return;

    const response = await fetch('https://productivityconf.com/.netlify/functions/mailchimp/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        listId: 'ef690bab60',
        // const data = {
        //   email_address: '',
        //   email_type: '',
        //   status: 'subscribed',
        //   merge_fields: {},
        //   interests: {},
        //   language: '',
        //   vip: false,
        //   location: { latitude: 0, longitude: 0 },
        //   marketing_permissions: [],
        //   ip_signup: '',
        //   timestamp_signup: '',
        //   ip_opt: '',
        //   timestamp_opt: '',
        //   tags: [],
        // };
        data: {
          email: formData.get('email'),
        },
      }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      console.log('success', result);
      // redirect to tickets page
    } else {
      // notify user about error
      console.log('error', result);
    }
  });
});
