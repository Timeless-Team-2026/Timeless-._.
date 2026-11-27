



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

let kitchenOrders = [];
let orderHistory = [];
let pendingItem = { name: "", price: 0 };

function escapeHtml(text) {
    if (!text) {
        return "";
    }
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function saveData() {
    localStorage.setItem("timeless_tables", JSON.stringify(tables));
    localStorage.setItem("timeless_kitchen_orders", JSON.stringify(kitchenOrders));
    localStorage.setItem("timeless_order_history", JSON.stringify(orderHistory));
    localStorage.setItem("timeless_order_number", String(orderNumber));
}

function loadData() {
    let savedTables = localStorage.getItem("timeless_tables");
    if (savedTables) {
        tables = JSON.parse(savedTables);
    }

    let savedKitchen = localStorage.getItem("timeless_kitchen_orders");
    if (savedKitchen) {
        kitchenOrders = JSON.parse(savedKitchen);
    }

    let savedHistory = localStorage.getItem("timeless_order_history");
    if (savedHistory) {
        orderHistory = JSON.parse(savedHistory);
    }

    let savedOrderNum = localStorage.getItem("timeless_order_number");
    if (savedOrderNum) {
        orderNumber = parseInt(savedOrderNum) || 101;
    }
}

const itemCustomizationOptions = {
    "Tea": ["No Sugar", "Less Sugar", "Extra Milk", "Extra Ginger"],
    "Coffee": ["No Sugar", "Less Sugar", "Extra Milk", "Strong Coffee"],
    "Noodles": ["No Onion", "Less Spicy", "Extra Spicy", "Extra Vegetables"],
    "Pizza": ["Extra Cheese", "No Onion", "Extra Toppings"],
    "Burger": ["Extra Cheese", "No Onion", "No Mayonnaise"],
    "Pasta": ["Extra Cheese", "Less Spicy", "Extra Sauce"]
};

function openCustomModal(name, price) {
    pendingItem = { name: name, price: parseInt(price) };
    $("#modal-item-title").text("Customize " + name + " (₹" + pendingItem.price + ")");

    let options = itemCustomizationOptions[name] || [];
    let optionsHtml = "";
    for (let i = 0; i < options.length; i++) {
        let opt = escapeHtml(options[i]);
        optionsHtml += '<label><input type="checkbox" class="custom-option" value="' + opt + '"> ' + opt + '</label>';
    }

    $("#modal-options-container").html(optionsHtml);
    $("#modal-special-note").val("");
    $("#custom-modal").css("display", "flex");
}

function closeCustomModal() {
    $("#custom-modal").hide();
}

function confirmAddCustomItem() {
    let selectedOptions = [];
    $(".custom-option:checked").each(function() {
        selectedOptions.push($(this).val());
    });

    let specialNote = $("#modal-special-note").val().trim();
    let customParts = [];

    if (selectedOptions.length > 0) {
        customParts.push(selectedOptions.join(", "));
    }
    if (specialNote !== "") {
        customParts.push("Note: " + specialNote);
    }

    let customText = customParts.join(" | ");
    addToCart(pendingItem.name, pendingItem.price, customText);
    closeCustomModal();
}

function addToCart(name, price, customNote) {
    let itemPrice = parseInt(price);
    let noteText = customNote || "";
    let itemFound = false;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name && (cart[i].customNote || "") === noteText) {
            cart[i].qty += 1;
            itemFound = true;
            break;
        }
    }

    if (!itemFound) {
        cart.push({
            name: name,
            price: itemPrice,
            qty: 1,
            customNote: noteText
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
            htmlString += '<div class="cart-item-info">';
            htmlString += '<span><strong>' + escapeHtml(item.name) + '</strong> (₹' + item.price + ')</span>';
            if (item.customNote && item.customNote !== "") {
                htmlString += '<span class="item-custom-text">' + escapeHtml(item.customNote) + '</span>';
            }
            htmlString += '</div>';
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
    saveData();
    showTables();

    alert("Order for " + $("#customer-name").val().trim() + " at Table " + (selectedTable + 1) + " is on hold.");
}

// Function to confirm order and send it to the kitchen queue
function confirmOrder() {
    if (!orderIsValid()) {
        return;
    }

    let totals = calculateTotals();
    let customerName = $("#customer-name").val().trim();
    let orderNote = $("#order-note").val().trim();
    let now = new Date();

    let newOrder = {
        id: orderNumber,
        tableIndex: selectedTable,
        tableName: tables[selectedTable].name,
        customerName: customerName,
        orderNote: orderNote,
        items: JSON.parse(JSON.stringify(cart)),
        subtotal: totals.subtotal,
        discountPercent: discountPercent,
        discount: totals.discount,
        vat: totals.vat,
        total: totals.total,
        status: "Pending",
        orderTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        orderDate: now.toLocaleDateString()
    };

    kitchenOrders.push(newOrder);

    // Mark table as Occupied automatically when order is confirmed
    tables[selectedTable].status = "Occupied";
    orderNumber++;

    saveData();
    resetOrder();
    showKitchenOrders();

    alert("Order #" + newOrder.id + " confirmed and sent to kitchen for " + newOrder.tableName + ".");
}

function showKitchenOrders() {
    let container = $("#kitchen-orders-list");

    if (kitchenOrders.length === 0) {
        container.html('<p class="empty-msg">No active orders in kitchen</p>');
        return;
    }

    let html = "";
    for (let i = 0; i < kitchenOrders.length; i++) {
        let order = kitchenOrders[i];
        let badgeClass = "status-" + order.status.toLowerCase();

        html += '<div class="kitchen-card">';
        html += '<div class="kitchen-card-header">';
        html += '<strong>Order #' + order.id + ' - ' + escapeHtml(order.tableName) + '</strong>';
        html += '<span class="status-badge ' + badgeClass + '">' + escapeHtml(order.status) + '</span>';
        html += '</div>';

        html += '<p><strong>Customer:</strong> ' + escapeHtml(order.customerName) + '</p>';
        html += '<p><strong>Time:</strong> ' + escapeHtml(order.orderTime) + '</p>';
        if (order.orderNote && order.orderNote !== "") {
            html += '<p><strong>Order Note:</strong> ' + escapeHtml(order.orderNote) + '</p>';
        }

        html += '<ul class="kitchen-items-list">';
        for (let j = 0; j < order.items.length; j++) {
            let item = order.items[j];
            html += '<li>' + escapeHtml(item.name) + ' x ' + item.qty;
            if (item.customNote && item.customNote !== "") {
                html += '<br><span class="item-custom-text">' + escapeHtml(item.customNote) + '</span>';
            }
            html += '</li>';
        }
        html += '</ul>';

        html += '<p><strong>Total: ₹' + order.total + '</strong></p>';

        html += '<div class="kitchen-actions">';
        if (order.status === "Pending") {
            html += '<button class="btn-status-next" onclick="updateOrderStatus(' + i + ', \'Preparing\')">Start Preparing</button>';
        } else if (order.status === "Preparing") {
            html += '<button class="btn-status-next" onclick="updateOrderStatus(' + i + ', \'Ready\')">Mark Ready</button>';
        } else if (order.status === "Ready") {
            html += '<button class="btn-status-served" onclick="updateOrderStatus(' + i + ', \'Served\')">Mark Served</button>';
        } else if (order.status === "Served") {
            html += '<button class="btn-bill-order" onclick="billKitchenOrder(' + i + ')">Complete Billing</button>';
        }
        html += '</div>';

        html += '</div>';
    }

    container.html(html);
}

function updateOrderStatus(index, newStatus) {
    if (!kitchenOrders[index]) {
        return;
    }
    kitchenOrders[index].status = newStatus;
    saveData();
    showKitchenOrders();
}

function buildBillText(orderData) {
    let note = orderData.orderNote && orderData.orderNote !== "" ? orderData.orderNote : "None";
    let bill = "====================================\n";
    bill += "       TIMELESS RESTAURANT BILL     \n";
    bill += "====================================\n";
    bill += "Order Number: #" + orderData.id + "\n";
    bill += "Customer: " + orderData.customerName + "\n";
    bill += "Table: " + orderData.tableName + "\n";
    bill += "Note: " + note + "\n";
    bill += "------------------------------------\n";
    bill += "Items Ordered:\n";

    for (let i = 0; i < orderData.items.length; i++) {
        let item = orderData.items[i];
        let linePrice = item.price * item.qty;
        bill += "- " + item.name + " x " + item.qty + " = ₹" + linePrice + "\n";
        if (item.customNote && item.customNote !== "") {
            bill += "  (" + item.customNote + ")\n";
        }
    }

    bill += "------------------------------------\n";
    bill += "Sub Total: ₹" + orderData.subtotal + "\n";
    bill += "Discount (" + orderData.discountPercent + "%): ₹" + orderData.discount + "\n";
    bill += "VAT (" + VAT_PERCENT + "%): ₹" + orderData.vat + "\n";
    bill += "Grand Total: ₹" + orderData.total + "\n";
    bill += "====================================\n";
    bill += "Thank you for dining with us!";
    return bill;
}

function addOrderToHistory(orderData) {
    let now = new Date();
    orderHistory.unshift({
        id: orderData.id,
        tableName: orderData.tableName,
        customerName: orderData.customerName,
        items: JSON.parse(JSON.stringify(orderData.items)),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        total: orderData.total
    });
}

function billKitchenOrder(index) {
    let order = kitchenOrders[index];
    if (!order) {
        return;
    }

    alert(buildBillText(order));

    addOrderToHistory(order);

    // Mark table as Available after billing is completed
    if (tables[order.tableIndex]) {
        tables[order.tableIndex].status = "Available";
    }

    kitchenOrders.splice(index, 1);

    saveData();
    showTables();
    showKitchenOrders();
    showOrderHistory();
}

function showOrderHistory() {
    let container = $("#order-history-list");

    if (orderHistory.length === 0) {
        container.html('<p class="empty-msg">No completed orders yet</p>');
        return;
    }

    let html = "";
    for (let i = 0; i < orderHistory.length; i++) {
        let entry = orderHistory[i];
        html += '<div class="history-card">';
        html += '<div class="history-card-header">';
        html += '<strong>Order #' + entry.id + '</strong>';
        html += '<span>' + escapeHtml(entry.tableName) + '</span>';
        html += '</div>';
        html += '<p><strong>Date:</strong> ' + escapeHtml(entry.date) + '</p>';
        html += '<p><strong>Time:</strong> ' + escapeHtml(entry.time) + '</p>';
        html += '<ul class="history-items-list">';
        for (let j = 0; j < entry.items.length; j++) {
            let item = entry.items[j];
            html += '<li>' + escapeHtml(item.name) + ' x ' + item.qty;
            if (item.customNote && item.customNote !== "") {
                html += ' (' + escapeHtml(item.customNote) + ')';
            }
            html += '</li>';
        }
        html += '</ul>';
        html += '<p><strong>Total Amount: ₹' + entry.total + '</strong></p>';
        html += '</div>';
    }

    container.html(html);
}

// Function to process payment, display bill alert, and clear order
function proceedPayment() {
    if (!orderIsValid()) {
        return;
    }

    let totals = calculateTotals();
    let customerName = $("#customer-name").val().trim();
    let note = $("#order-note").val().trim();

    let directOrder = {
        id: orderNumber,
        tableIndex: selectedTable,
        tableName: tables[selectedTable].name,
        customerName: customerName,
        orderNote: note,
        items: JSON.parse(JSON.stringify(cart)),
        subtotal: totals.subtotal,
        discountPercent: discountPercent,
        discount: totals.discount,
        vat: totals.vat,
        total: totals.total
    };

    // Display bill alert
    alert(buildBillText(directOrder));

    // Save completed order to history
    addOrderToHistory(directOrder);

    // Free the table
    tables[selectedTable].status = "Available";

    // Increment order number
    orderNumber++;

    saveData();

    // Reset the order
    resetOrder();
    showOrderHistory();
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
    // 1. Load saved data and render tables, cart, kitchen queue, and history
    loadData();
    showTables();
    showCart();
    showKitchenOrders();
    showOrderHistory();

    // 2. Smooth scroll to #menu when clicking Order Now or View Menu
    $("#btn-order-now").on("click", function() {
        window.location.hash = "#menu";
    });

    $("#btn-view-menu").on("click", function() {
        window.location.hash = "#menu";
    });

    // 3. Add to cart button opens item customization modal
    $(".add-btn").on("click", function() {
        let itemName = $(this).attr("item_name");
        let itemPrice = $(this).attr("item_price");
        openCustomModal(itemName, itemPrice);
    });

    // Modal action buttons
    $("#btn-modal-add").on("click", confirmAddCustomItem);
    $("#btn-modal-cancel").on("click", closeCustomModal);

    // 4. Click table card directly using custom table_no attribute
    $(".table-card").on("click", function() {
        let tableNo = parseInt($(this).attr("table_no"));
        pickTable(tableNo - 1);
    });

    // 5. Connect order control buttons to functions
    $("#btn-select-table").on("click", selectTable);
    $("#btn-discount").on("click", applyDiscount);
    $("#btn-hold").on("click", holdOrder);
    $("#btn-confirm-order").on("click", confirmOrder);
    $("#btn-pay").on("click", proceedPayment);
});
