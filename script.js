const VAT_PERCENT = 0;

const tables = [
    { name: "Table 1", status: "Available" },
    { name: "Table 2", status: "Occupied" },
    { name: "Table 3", status: "Available" },
    { name: "Table 4", status: "Reserved" }
];

let cart = [];
let selectedTable = -1;
let discountPercent = 0;
let orderNumber = 1;

function addToCart(name, price) {
    price = parseInt(price);

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
            cart[i].qty++;
            showCart();
            return;
        }
    }

    cart.push({
        name: name,
        price: price,
        qty: 1
    });

    showCart();
}

function changeQty(index, change) {
    cart[index].qty = cart[index].qty + change;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    showCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    showCart();
}

function calculateTotals() {
    let subtotal = 0;

    for (let i = 0; i < cart.length; i++) {
        subtotal = subtotal + (cart[i].price * cart[i].qty);
    }

    let discount = Math.round(subtotal * discountPercent / 100);
    let amountAfterDiscount = subtotal - discount;
    let vat = Math.round(amountAfterDiscount * VAT_PERCENT / 100);
    let total = amountAfterDiscount + vat;

    return {
        subtotal: subtotal,
        discount: discount,
        vat: vat,
        total: total
    };
}

function showCart() {
    let html = "";

    if (cart.length === 0) {
        html = '<p class="empty-cart">No items added yet</p>';
    } else {
        for (let i = 0; i < cart.length; i++) {
            let item = cart[i];
            let linePrice = item.price * item.qty;

            html += `
                <div class="cart-item">
                    <div>
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price} each · ₹${linePrice}</div>
                    </div>

                    <div class="cart-controls">
                        <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
                        <button class="remove-btn" onclick="removeItem(${i})">×</button>
                    </div>
                </div>
            `;
        }
    }

    $("#items-list").html(html);

    let totals = calculateTotals();

    $("#sub-total").text(totals.subtotal);
    $("#discount-percent").text(discountPercent);
    $("#discount-amount").text(totals.discount);
    $("#vat-percent").text(VAT_PERCENT);
    $("#vat-amount").text(totals.vat);
    $("#grand-total").text(totals.total);
}

function showTables() {
    for (let i = 0; i < tables.length; i++) {
        let tableId = "#table" + (i + 1);
        let statusId = "#table" + (i + 1) + "-status";
        let tableColour = "white";

        switch (tables[i].status) {
            case "Available":
                tableColour = "#e7f6ec";
                break;

            case "Occupied":
                tableColour = "#fde8e8";
                break;

            case "Reserved":
                tableColour = "#fff4d6";
                break;
        }

        $(tableId).css("background-color", tableColour);
        $(statusId).text(tables[i].status);

        if (selectedTable === i) {
            $(tableId).css("border", "3px solid #344a54");
        } else {
            $(tableId).css("border", "2px solid #e5e8eb");
        }
    }

    if (selectedTable === -1) {
        $("#btn-select-table").text("Select Table");
    } else {
        $("#btn-select-table").text("Table " + (selectedTable + 1) + " selected");
    }
}

function pickTable(index) {
    if (index < 0 || index >= tables.length) {
        alert("Invalid table.");
        return;
    }

    if (selectedTable === index) {
        alert("This table is already selected.");
        return;
    }

    if (tables[index].status !== "Available") {
        alert("This table is not available.");
        return;
    }

    if (
        selectedTable !== -1 &&
        tables[selectedTable].status === "Reserved"
    ) {
        alert("This order is on hold. Complete it before selecting another table.");
        return;
    }

    if (selectedTable !== -1) {
        tables[selectedTable].status = "Available";
    }

    selectedTable = index;
    tables[selectedTable].status = "Occupied";

    showTables();
}

function selectTable() {
    let input = prompt("Enter a table number from 1 to 4:");

    if (input === null) {
        return;
    }

    let tableNum = parseInt(input);

    if (
        isNaN(tableNum) ||
        String(tableNum) !== input.trim() ||
        tableNum < 1 ||
        tableNum > 4
    ) {
        alert("Enter a valid whole table number from 1 to 4.");
        return;
    }

    pickTable(tableNum - 1);
}

function applyDiscount() {
    if (cart.length === 0) {
        alert("Add items to the cart before applying a discount.");
        return;
    }

    let input = prompt("Enter discount percentage from 0 to 100:");

    if (input === null) {
        return;
    }

    let discount = parseInt(input);

    if (
        isNaN(discount) ||
        String(discount) !== input.trim() ||
        discount < 0 ||
        discount > 100
    ) {
        alert("Enter a whole percentage from 0 to 100.");
        return;
    }

    discountPercent = discount;
    showCart();
}

function orderIsValid() {
    let customerName = $("#customer-name").val().trim();

    if (customerName === "") {
        alert("Please enter the customer's name.");
        return false;
    }

    if (selectedTable === -1) {
        alert("Please select an available table.");
        return false;
    }

    if (cart.length === 0) {
        alert("Please add at least one item to the cart.");
        return false;
    }

    return true;
}

function holdOrder() {
    if (!orderIsValid()) {
        return;
    }

    tables[selectedTable].status = "Reserved";

    showTables();

    alert("Order #" + orderNumber + " is on hold for " + tables[selectedTable].name + ".");
}

function proceedPayment() {
    if (!orderIsValid()) {
        return;
    }

    let totals = calculateTotals();
    let customerName = $("#customer-name").val().trim();
    let orderNote = $("#order-note").val().trim();
    let tableName = tables[selectedTable].name;

    let bill = "========== TIMELESS RESTAURANT ==========\n";
    bill += "Order Number: " + orderNumber + "\n";
    bill += "Customer: " + customerName + "\n";
    bill += "Table: " + tableName + "\n";

    if (orderNote !== "") {
        bill += "Note: " + orderNote + "\n";
    }

    bill += "-----------------------------------------\n";
    bill += "ITEMS\n";

    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        bill += item.name + " x " + item.qty + " = ₹" + (item.price * item.qty) + "\n";
    }

    bill += "-----------------------------------------\n";
    bill += "Subtotal: ₹" + totals.subtotal + "\n";
    bill += "Discount (" + discountPercent + "%): ₹" + totals.discount + "\n";
    bill += "VAT (" + VAT_PERCENT + "%): ₹" + totals.vat + "\n";
    bill += "TOTAL: ₹" + totals.total + "\n";
    bill += "=========================================";

    alert(bill);

    tables[selectedTable].status = "Available";

    orderNumber++;

    resetOrder();
}

function resetOrder() {
    cart = [];
    selectedTable = -1;
    discountPercent = 0;

    $("#customer-name").val("");
    $("#order-note").val("");

    showCart();
    showTables();
}

$(function() {
    showTables();
    showCart();

    $("#btn-order-now").on("click", function() {
        window.location.hash = "menu";
    });

    $("#btn-view-menu").on("click", function() {
        window.location.hash = "menu";
    });

    $(".add-btn").on("click", function() {
        let itemName = $(this).attr("item_name");
        let itemPrice = $(this).attr("item_price");

        addToCart(itemName, itemPrice);
    });

    $(".table-card").on("click", function() {
        let tableNumber = parseInt($(this).attr("table_no"));

        pickTable(tableNumber - 1);
    });

    $("#btn-select-table").on("click", selectTable);
    $("#btn-discount").on("click", applyDiscount);
    $("#btn-hold").on("click", holdOrder);
    $("#btn-pay").on("click", proceedPayment);
});
