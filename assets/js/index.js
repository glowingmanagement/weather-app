const searchInput = $("#search-input");

const handleFormSubmit = (event) => {
  event.preventDefault();
  console.log("Works");
};

searchInput.submit(handleFormSubmit);
