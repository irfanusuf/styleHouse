document.addEventListener("DOMContentLoaded", function () {
  function updateCartTotal() {
    const cartItems = document.querySelectorAll(".cart-item");
    let total = 0;

    cartItems.forEach(function (item) {
      const priceElement = item.querySelector(".item-price");
      const quantityElement = item.querySelector(".item-quantity");
      const totalElement = item.querySelector(".item-total");

      const price = parseFloat(priceElement.textContent.replace("$", ""));
      const quantity = parseInt(quantityElement.value);
      const itemTotal = price * quantity;
      totalElement.textContent = `$${itemTotal.toFixed(2)}`;
      total += itemTotal;
    });

    const cartTotalElement = document.querySelector(".cart-total h3");
    const cartContainer = document.querySelector(".cart-container");
    const emptyCartMessage = document.querySelector(".empty-cart-message");
    const checkoutButton = document.querySelector(".btn-checkout");

    cartTotalElement.textContent = `Cart Total: $${total.toFixed(2)}`;

    if (total === 0) {
      cartContainer.style.display = "none";
      emptyCartMessage.style.display = "block";
      checkoutButton.style.display = "none";
    } else {
      cartContainer.style.display = "block";
      emptyCartMessage.style.display = "none";
      checkoutButton.style.display = "inline-block";
    }
  }

  document
    .querySelectorAll(".item-quantity")
    .forEach(function (quantityElement) {
      quantityElement.addEventListener("change", updateCartTotal);
    });

  document.querySelectorAll(".btn-remove").forEach(function (removeButton) {
    removeButton.addEventListener("click", function () {
      removeButton.closest(".cart-item").remove();
      updateCartTotal();
    });
  });

  updateCartTotal();
});

document.getElementById("dropdown").addEventListener("click", () => {
  const targetdiv = document.getElementById("dropdown-list");

  targetdiv.classList.remove("display-none");
});

document.getElementById("dropdown-close").addEventListener("click", () => {
  const targetdiv = document.getElementById("dropdown-list");

  targetdiv.classList.add("display-none");
});


// document.getElementById("logout").addEventListener("click", () => {
//     const targetdiv = document.getElementById("dropdown-list");
  
//     targetdiv.classList.toggle("display-none");
//   });