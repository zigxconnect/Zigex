
const slugifyUsername = (username) => {
  if (!username) return "";
  return username.toString().trim().replace(/\s+/g, "_");
}

// console.log("Test 1:", slugifyUsername("Dark web"));
// console.log("Test 2:", slugifyUsername("Dark  web"));
// console.log("Test 3:", slugifyUsername(" Dark web "));
