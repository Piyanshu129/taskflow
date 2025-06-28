document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const nameInput = document.getElementById("name");
  const dobInput = document.getElementById("dob");
  const error = document.getElementById("error");

  const existingUser = localStorage.getItem("user");
  if (existingUser) {
    window.location.href = "app.html";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const dob = new Date(dobInput.value);
    const age = getAge(dob);

    if (!name || !dobInput.value) {
      error.textContent = "All fields are required.";
      return;
    }

    if (age <= 10) {
      error.textContent = "You must be older than 10 to use TaskFlow.";
      return;
    }

    const user = { name, dob: dobInput.value };
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "app.html";
  });

  function getAge(dob) {
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
});
