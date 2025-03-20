document.querySelector("#theme-select").addEventListener("change", (e) => {
  document
    .querySelector("#theme")
    .setAttribute("href", `semantic/${e.target.value}.css`);
  document
    .querySelector("#scheme")
    .setAttribute("href", `semantic/scheme-${e.target.value}.css`);
});

document.querySelector("#channel-select").addEventListener("change", (e) => {
  document
    .querySelector("#channel")
    .setAttribute("href", `semantic/${e.target.value}.css`);
});
