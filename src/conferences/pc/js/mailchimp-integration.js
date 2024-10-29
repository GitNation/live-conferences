window.mailchimpIntegration = {
  subscribe: async function({ email }) {
    const origin = location.origin;
    const response = await fetch(`${origin}/.netlify/functions/mailchimp`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
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
          email: email,
          status: 'subscribed',
        },
      }),
    });

    const result = await response.json();

    if (!result.error) {
      console.log('success', result);
      return {
        hasError: false,
        data: result,
      };
    } else {
      console.log('error', result.error, result.mailchimpErrors);
      return {
        hasError: true,
        error: result.error,
        mailchimpErrors: result.mailchimpErrors,
        data: result.data,
      };
    }
  },

  checkIfEmailIsAlreadySubscribed: async function({ email }) {
    const origin = location.origin;
    const response = await fetch(`${origin}/.netlify/functions/mailchimp-member-exists`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: email,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { hasError: true, error: result.error };
    }

    return {
      hasError: false,
      data: result.data,
    };
  },
};
