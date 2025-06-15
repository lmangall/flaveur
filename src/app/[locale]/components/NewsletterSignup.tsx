const handleSubscribe = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbxoWGdT4DyZBj31zV_2F9xZ7i2Oap5lDZoVXwfbBS7o0d3f21Jwin4UHEK80MI4fqu6/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email }).toString(),
      }
    );

    // WARNING:
    // Due to CORS restrictions on Google Apps Script,
    // the browser blocks reading the actual response.
    // Therefore, we optimistically show success toast here,
    // even if the response status is not accessible.
    toast.success(t("subscribeSuccess"));
    setEmail("");
  } catch {
    // This catch block only triggers on network errors,
    // it won't trigger if Google Apps Script returns an error response
    toast.error(t("subscribeError"));
  } finally {
    setIsLoading(false);
  }
};
