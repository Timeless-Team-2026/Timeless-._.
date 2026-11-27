



const VAT_PERCENT = 0;

// Array of table objects tracking status for each table
let tables = [
    { name: "Table 1", status: "Available" },
    { name: "Table 2", status: "Occupied" },
    { name: "Table 3", status: "Available" },
    { name: "Table 4", status: "Reserved" }
];

let cart = [];

let selectedTable = -1;


let discountPercent = 0;

let orderNumber = 101;




function addToCart(name, price) {
    let itemPrice = parseInt(price);
    let itemFound = false;

   
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
            cart[i].qty += 1;
            itemFound = true;
            break;
        }
    }

  
    if (!itemFound) {
        cart.push({
            name: name,
            price: itemPrice,
            qty: 1
        });
    }

  
    showCart();
}


function changeQty(index, change) {
    cart[index].qty += change;

    // If quantity drops to zero or below, remove item using splice
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    // Refresh cart display
    showCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    showCart();
}

// Function to calculate subtotal, discount, VAT, and grand total
function calculateTotals() {
    let subtotal = 0;

   
    for (let i = 0; i < cart.length; i++) {
        subtotal += cart[i].price * cart[i].qty;
    }

    
    let discount = Math.round((subtotal * discountPercent) / 100);

   
    let taxableAmount = subtotal - discount;
    let vat = Math.round((taxableAmount * VAT_PERCENT) / 100);

    // Calculate final grand total
    let total = taxableAmount + vat;

    return {
        subtotal: subtotal,
        discount: discount,
        vat: vat,
        total: total
    };
}

function showCart() {
    let itemsList = $("#items-list");

    
    if (cart.length === 0) {
        itemsList.html("<p>No items added yet</p>");
    } else {
        let htmlString = "";

        for (let i = 0; i < cart.length; i++) {
            let item = cart[i];
            let linePrice = item.price * item.qty;

            htmlString += '<div class="cart-item">';
            htmlString += '<span><strong>' + item.name + '</strong> (₹' + item.price + ')</span>';
            htmlString += '<span>';
            htmlString += '<button class="qty-btn" onclick="changeQty(' + i + ', -1)">-</button>';
            htmlString += ' ' + item.qty + ' ';
            htmlString += '<button class="qty-btn" onclick="changeQty(' + i + ', 1)">+</button>';
            htmlString += ' ₹' + linePrice;
            htmlString += '<button class="remove-btn" onclick="removeItem(' + i + ')">x</button>';
            htmlString += '</span>';
            htmlString += '</div>';
        }

        itemsList.html(htmlString);
    }

  
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
        let tableCard = $("#table" + (i + 1));
        let statusParagraph = $("#table" + (i + 1) + "-status");
        let status = tables[i].status;

        // Update the status text
        statusParagraph.text(status);

       
        switch (status) {
            case "Available":
                tableCard.css("background-color", "#d4edda"); 
                statusParagraph.css("color", "#155724");
                break;
            case "Occupied":
                tableCard.css("background-color", "#f8d7da"); 
                statusParagraph.css("color", "#721c24");
                break;
            case "Reserved":
                tableCard.css("background-color", "#fff3cd"); 
                statusParagraph.css("color", "#856404");
                break;
            default:
                tableCard.css("background-color", "#ffffff");
                statusParagraph.css("color", "#000000");
                break;
        }

       
        if (i === selectedTable) {
            tableCard.css("border", "3px solid #101ca4");
        } else {
            tableCard.css("border", "1px solid #ddd");
        }
    }
}


function pickTable(index) {

    if (index === selectedTable) {
        alert("Table " + (index + 1) + " is already selected!");
        return;
    }

   
    if (tables[index].status !== "Available") {
        alert("Table " + (index + 1) + " is not available! It is currently " + tables[index].status + ".");
        return;
    }

    
    if (selectedTable !== -1) {
        tables[selectedTable].status = "Available";
    }

    
    selectedTable = index;
    tables[selectedTable].status = "Occupied";

   
    $("#btn-select-table").text("Table " + (selectedTable + 1) + " selected");

    // Refresh table cards
    showTables();
}

function selectTable() {
    let input = prompt("Enter a table number (1 to 4):");

  
    if (input === null) {
        return;
    }

    let tableNum = parseInt(input);

    if (isNaN(tableNum) || tableNum < 1 || tableNum > 4) {
        alert("Invalid table number! Please enter a number between 1 and 4.");
        return;
    }

    // Call pickTable with 0-based index
    pickTable(tableNum - 1);
}


// Function to prompt for and apply a discount percentage
function applyDiscount() {
    // Require items in cart before discounting
    if (cart.length === 0) {
        alert("Please add items to the cart before applying a discount!");
        return;
    }

    let input = prompt("Enter discount percentage (0 to 100):", discountPercent);

    // Exit if user cancelled prompt
    if (input === null) {
        return;
    }

    let discount = parseInt(input);

    // Validate input percentage
    if (isNaN(discount) || discount < 0 || discount > 100) {
        alert("Invalid discount percentage! Please enter a number from 0 to 100.");
        return;
    }

    discountPercent = discount;

    // Refresh totals
    showCart();
}

function orderIsValid() {
    let customerName = $("#customer-name").val().trim();

  
    if (customerName === "") {
        alert("Please enter customer name!");
        return false;
    }

    if (selectedTable === -1) {
        alert("Please select a table!");
        return false;
    }

    // Check cart items
    if (cart.length === 0) {
        alert("Cart is empty! Please add at least one item.");
        return false;
    }

    return true;
}

// Function to place the current order on hold and reserve the table
function holdOrder() {
    if (!orderIsValid()) {
        return;
    }

    // Set selected table status to Reserved
    tables[selectedTable].status = "Reserved";
    showTables();

    alert("Order for " + $("#customer-name").val().trim() + " at Table " + (selectedTable + 1) + " is on hold.");
}

// Function to process payment, display bill alert, and clear order
function proceedPayment() {
    if (!orderIsValid()) {
        return;
    }

    let totals = calculateTotals();
    let customerName = $("#customer-name").val().trim();
    let note = $("#order-note").val().trim();
    if (note === "") {
        note = "None";
    }

    // Build receipt string with concatenation
    let bill = "====================================\n";
    bill += "       TIMELESS RESTAURANT BILL     \n";
    bill += "====================================\n";
    bill += "Order Number: #" + orderNumber + "\n";
    bill += "Customer: " + customerName + "\n";
    bill += "Table: " + tables[selectedTable].name + "\n";
    bill += "Note: " + note + "\n";
    bill += "------------------------------------\n";
    bill += "Items Ordered:\n";

    for (let i = 0; i < cart.length; i++) {
        let linePrice = cart[i].price * cart[i].qty;
        bill += "- " + cart[i].name + " x " + cart[i].qty + " = ₹" + linePrice + "\n";
    }

    bill += "------------------------------------\n";
    bill += "Sub Total: ₹" + totals.subtotal + "\n";
    bill += "Discount (" + discountPercent + "%): ₹" + totals.discount + "\n";
    bill += "VAT (" + VAT_PERCENT + "%): ₹" + totals.vat + "\n";
    bill += "Grand Total: ₹" + totals.total + "\n";
    bill += "====================================\n";
    bill += "Thank you for dining with us!";

    // Display bill alert
    alert(bill);

    // Free the table
    tables[selectedTable].status = "Available";

    // Increment order number
    orderNumber++;

    // Reset the order
    resetOrder();
}

// Function to reset all order fields and state
function resetOrder() {
    cart = [];
    selectedTable = -1;
    discountPercent = 0;

    $("#customer-name").val("");
    $("#order-note").val("");
    $("#btn-select-table").text("Select Table");

    showTables();
    showCart();
}




$(function() {
    // 1. Initial render of tables and cart on page load
    showTables();
    showCart();

    // 2. Smooth scroll to #menu when clicking Order Now or View Menu
    $("#btn-order-now").on("click", function() {
        window.location.hash = "#menu";
    });

    $("#btn-view-menu").on("click", function() {
        window.location.hash = "#menu";
    });

    // 3. Add to cart button click handler using custom attributes
    $(".add-btn").on("click", function() {
        let itemName = $(this).attr("item_name");
        let itemPrice = $(this).attr("item_price");
        addToCart(itemName, itemPrice);
    });

    // 4. Click table card directly using custom table_no attribute
    $(".table-card").on("click", function() {
        let tableNo = parseInt($(this).attr("table_no"));
        pickTable(tableNo - 1);
    });

    // 5. Connect order control buttons to functions
    $("#btn-select-table").on("click", selectTable);
    $("#btn-discount").on("click", applyDiscount);
    $("#btn-hold").on("click", holdOrder);
    $("#btn-pay").on("click", proceedPayment);
});
