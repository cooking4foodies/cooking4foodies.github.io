// Item prices mapping lookup mapped to Menu Card
const itemPrices = {
    "Beguni (4 Pcs)": 99,
    "Masoor Daler Bora (8 Pcs)": 149,
    "Chicken Pakoda with Green Chutney (8 Pcs)": 299,
    "Masala Fish Fry (2 Pcs)": 249,
    "Machh Bhaja - Plain Fish Fry (2 Pcs)": 199,
    "Egg Omelette (2 Eggs)": 99,
    "Dhokar Dalna (4 Pcs)": 249,
    "Phulkopi Alur Torkari - Serves 2": 249,
    "Alu Posto - Serves 2": 299,
    "Potol Posto - Serves 2": 299,
    "Potol Alur Torkari - Serves 2": 249,
    "Bhindi Peanut Masala Dry - Serves 2": 249,
    "Mooger Dal Bengali Style - Serves 2": 199,
    "Chholar Dal Bengali Style - Serves 2": 199,
    "Lau Ghonto - Serves 2": 199,
    "Korola Bhaja - Serves 2": 119,
    "Alur Dom (6 Pcs)": 149,
    "Alu Bhaja - Serves 2": 99,
    "Potol Bhaja - Serves 2": 99,
    "Chicken Kosha - Spicy Chicken Curry (4 Pcs)": 299,
    "Chicken Jhol - Bengali Chicken Curry (4 Pcs)": 299,
    "Machher Kalia - Bengali Fish Delicacy (2 Pcs)": 299,
    "Doi Machh - Fish in Yogurt Gravy (2 Pcs)": 299,
    "Machher Jhol - with jeere bata & alu (2 Pcs)": 249,
    "Chilli Chicken - Kolkata Style (8 Pcs)": 299,
    "Dhania Chicken (4 Pcs)": 299,
    "Paalak Chicken (4 Pcs)": 299,
    "Dim Kosha - Bengali Egg Curry (2 Pcs)": 149,
    "Basanti Pulao": 299,
    "Steamed Basmati Rice - Serves 1": 79,
    "Luchi (4 Pcs)": 69,
    "Parotta - Plain (1 Pcs)": 29,
    "Roti (1 Pcs)": 15,
    "Mutton Kosha (4 Pcs)": 399,
    "Champaran Mutton (4 Pcs)": 399,
    "Chingrir Malaicurry (Small - 4 Pcs/Big - 2 Pcs)": 299,
    "Kolkata Chicken Biriyani with Egg & Alu": 399,
    "Ilish Bhapa - Seasonal": 0,
    "Sorshe Ilish - Seasonal": 0,
    "Pabdar Jhal - Seasonal": 0
};

function bounce(el) {
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
}

function updateCartSummary() {
    const rows = document.getElementsByClassName('item-row');
    let totalQty = 0;
    let totalPrice = 0;

    for (let row of rows) {
        const select = row.querySelector('select');
        const qtyInput = row.querySelector('.qty-box input');
        const selectedItem = select.value;
        const qty = parseInt(qtyInput.value) || 0;

        if (selectedItem && qty > 0) {
            totalQty += qty;
            if (itemPrices[selectedItem]) {
                totalPrice += itemPrices[selectedItem] * qty;
            }
        }
    }

    const badge = document.getElementById('cart-count');
    badge.innerText = totalQty;
    bounce(badge);

    // Mobile hamburger notification: mirrors the cart count so a mobile
    // user can see there's something in the cart without opening the menu.
    const menuBadge = document.getElementById('menu-cart-badge');
    if (menuBadge) {
        menuBadge.innerText = totalQty;
        if (totalQty > 0) {
            menuBadge.hidden = false;
            bounce(menuBadge);
        } else {
            menuBadge.hidden = true;
        }
    }

    document.getElementById('total-amount').innerText = '₹' + totalPrice;
}

function addMoreItem(selectedItemVal = "") {
    const container = document.getElementById('items-container');
    if (container.children.length === 0) return;
    const newRow = container.children[0].cloneNode(true);
    const selectElem = newRow.querySelector('select');

    if (selectedItemVal) {
        selectElem.value = selectedItemVal;
    } else {
        selectElem.selectedIndex = 0;
    }
    newRow.querySelector('.qty-box input').value = '1';
    container.appendChild(newRow);
    updateCartSummary();
}

function addToCart(itemName, btnElement) {
    btnElement.classList.remove('btn-clicked');
    void btnElement.offsetWidth;
    btnElement.classList.add('btn-clicked');

    const container = document.getElementById('items-container');
    const rows = container.getElementsByClassName('item-row');

    let found = false;
    for (let row of rows) {
        const select = row.querySelector('select');
        if (select.value === itemName) {
            const qtyInput = row.querySelector('.qty-box input');
            qtyInput.value = parseInt(qtyInput.value) + 1;
            found = true;
            break;
        }
    }

    if (!found) {
        for (let row of rows) {
            const select = row.querySelector('select');
            if (!select.value) {
                select.value = itemName;
                found = true;
                break;
            }
        }
    }

    if (!found) {
        addMoreItem(itemName);
    } else {
        updateCartSummary();
    }
}

function changeQty(btn, delta) {
    const input = btn.parentElement.querySelector('input');
    let val = parseInt(input.value) + delta;
    if (val < 0) val = 0;
    input.value = val;

    if (val === 0) {
        const container = document.getElementById('items-container');
        const row = btn.closest('.item-row');
        if (container.children.length > 1) {
            row.remove();
        } else {
            input.value = 1;
            row.querySelector('select').selectedIndex = 0;
        }
    }
    updateCartSummary();
}

function removeItemRow(btn) {
    const container = document.getElementById('items-container');
    const row = btn.closest('.item-row');
    if (container.children.length > 1) {
        row.remove();
    } else {
        row.querySelector('select').selectedIndex = 0;
        row.querySelector('.qty-box input').value = 1;
    }
    updateCartSummary();
}

// ---------------------------------------------------------------
// UPI payment flow
//
// IMPORTANT: a static site cannot verify UPI payments by itself.
// A plain UPI QR to a personal VPA has no callback, so the customer
// self-reports the UPI reference number and Sonali cross-checks it
// against her bank notification. Payment status is therefore recorded
// as "Pending Verification", never as confirmed-by-the-site.
// ---------------------------------------------------------------
const UPI_VPA = 'sonali.debnath4u@okicici';
const UPI_PAYEE_NAME = 'Cooking 4 Foodies';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1pOgDOYrL_GqkHe24cJWnjMf_9eWlvGo-ROYJhI55jupQjH96M90KGl_HWqrOkddzeA/exec';

// Holds the order being paid for, between opening the payment modal
// and the customer confirming payment.
let pendingOrder = null;
let selectedPaymentMethod = 'upi';

function generateOrderId() {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    // 4 random alphanumeric chars, ambiguous characters (0/O/1/I) excluded
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `C4F-${yy}${mm}${dd}-${suffix}`;
}

function buildUpiUri(amount, orderId) {
    const params = new URLSearchParams({
        pa: UPI_VPA,
        pn: UPI_PAYEE_NAME,
        am: Number(amount).toFixed(2),
        cu: 'INR',
        tn: 'Order ' + orderId
    });
    // URLSearchParams encodes spaces as "+", which some UPI apps show
    // literally ("Cooking+4+Foodies"). %20 is handled correctly everywhere.
    return 'upi://pay?' + params.toString().replace(/\+/g, '%20');
}

function handleOrderSubmit(event) {
    event.preventDefault();

    const formInputs = document.querySelectorAll('#orderForm input, #orderForm textarea');
    const name = formInputs[0].value.trim();
    const email = formInputs[1].value.trim();
    const contact = formInputs[2].value.trim();
    const address = formInputs[3].value.trim();

    const rows = document.getElementsByClassName('item-row');
    let orderedItemsList = [];
    let totalPrice = 0;
    for (let row of rows) {
        const select = row.querySelector('select');
        const qtyInput = row.querySelector('.qty-box input');
        const qty = parseInt(qtyInput.value) || 0;
        if (select.value && qty > 0) {
            orderedItemsList.push(select.value + " (Qty: " + qty + ")");
            if (itemPrices[select.value]) {
                totalPrice += itemPrices[select.value] * qty;
            }
        }
    }

    if (orderedItemsList.length === 0) {
        alert('Please select at least one item before placing your order.');
        return;
    }

    // Seasonal "Ask for price" items have no price, so they can't be prepaid.
    if (totalPrice <= 0) {
        alert('Your selection contains only seasonal items priced on request. Please call +91-8976180617 to place this order.');
        return;
    }

    pendingOrder = {
        orderId: generateOrderId(),
        name: name, email: email, contact: contact, address: address,
        items: orderedItemsList.join(', '),
        amount: totalPrice
    };

    openPaymentModal(pendingOrder);
}

function openPaymentModal(order) {
    document.getElementById('pay-order-id-value').innerText = order.orderId;
    document.getElementById('pay-amount-value').innerText = '₹' + order.amount;
    document.getElementById('pay-vpa-value').innerText = UPI_VPA;

    const upiUri = buildUpiUri(order.amount, order.orderId);
    document.getElementById('pay-upi-link').setAttribute('href', upiUri);

    // Render the QR fresh each time (clears any previous order's code)
    const qrBox = document.getElementById('pay-qr');
    qrBox.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrBox, {
            text: upiUri,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.M
        });
    } else {
        qrBox.innerHTML = '<p style="font-size:1.3rem;color:#888;">QR unavailable — please use the "pay now" button or pay manually to ' + UPI_VPA + '</p>';
    }

    document.getElementById('pay-ref-input').value = '';
    document.getElementById('pay-cod-amount').innerText = '₹' + order.amount;
    selectPaymentMethod('upi');
    hidePayError();
    document.getElementById('paymentModal').style.display = 'flex';
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    const isUpi = method === 'upi';

    document.getElementById('pay-pane-upi').style.display = isUpi ? 'block' : 'none';
    document.getElementById('pay-pane-cod').style.display = isUpi ? 'none' : 'block';

    document.getElementById('pay-tab-upi').classList.toggle('active', isUpi);
    document.getElementById('pay-tab-cod').classList.toggle('active', !isUpi);

    document.getElementById('pay-confirm-btn').innerText =
        isUpi ? 'confirm payment' : 'place order';

    hidePayError();
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    pendingOrder = null;
}

function showPayError(msg) {
    const el = document.getElementById('pay-error');
    el.innerText = msg;
    el.style.display = 'block';
}

function hidePayError() {
    document.getElementById('pay-error').style.display = 'none';
}

function confirmPayment() {
    if (!pendingOrder) return;

    const isUpi = selectedPaymentMethod === 'upi';
    let ref = '';

    if (isUpi) {
        ref = document.getElementById('pay-ref-input').value.trim();
        if (!/^\d{12}$/.test(ref)) {
            showPayError('Please enter the 12-digit UPI reference number from your payment app.');
            return;
        }
    }
    hidePayError();

    const btn = document.getElementById('pay-confirm-btn');
    const originalLabel = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'submitting...';

    const orderData = {
        orderId: pendingOrder.orderId,
        name: pendingOrder.name,
        email: pendingOrder.email,
        contact: pendingOrder.contact,
        address: pendingOrder.address,
        items: pendingOrder.items,
        totalAmount: '₹' + pendingOrder.amount,
        paymentMethod: isUpi ? 'UPI (Prepaid)' : 'Cash on Delivery',
        upiReference: isUpi ? ref : '',
        paymentStatus: isUpi ? 'Pending Verification' : 'To Collect on Delivery',
        paidTo: isUpi ? UPI_VPA : '',
        orderedAt: new Date().toLocaleString('en-IN')
    };

    fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
        .then(() => {
            const placedId = pendingOrder.orderId;
            const contact = pendingOrder.contact;
            const amount = pendingOrder.amount;
            document.getElementById('paymentModal').style.display = 'none';

            const tail = isUpi
                ? 'We will confirm your payment and call you shortly on ' + contact + '.'
                : 'Please keep <strong>₹' + amount + '</strong> ready in cash for the delivery. ' +
                  'We will call you shortly on ' + contact + ' to confirm.';

            document.getElementById('success-message').innerHTML =
                'Your order <strong>' + placedId + '</strong> has been received.<br>' + tail;
            document.getElementById('successModal').style.display = 'flex';
            pendingOrder = null;
        })
        .catch(error => {
            console.error('Error!', error.message);
            showPayError('Could not submit your order. Please try again, or call +91-8976180617.');
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerText = originalLabel;
        });
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('orderForm').reset();
    // Reset the item rows back to a single empty row
    const container = document.getElementById('items-container');
    while (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }
    const firstRow = container.children[0];
    if (firstRow) {
        firstRow.querySelector('select').selectedIndex = 0;
        firstRow.querySelector('.qty-box input').value = 1;
    }
    updateCartSummary();
}

window.addEventListener('DOMContentLoaded', function () {
    updateCartSummary();

    // Mobile hamburger menu toggle
    const menu = document.querySelector('#menu-bar');
    const navbar = document.querySelector('.navbar');

    if (menu && navbar) {
        menu.onclick = () => {
            menu.classList.toggle('fa-times');
            navbar.classList.toggle('active');
            menu.setAttribute('aria-expanded', navbar.classList.contains('active'));
        };

        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.onclick = () => {
                menu.classList.remove('fa-times');
                navbar.classList.remove('active');
                menu.setAttribute('aria-expanded', 'false');
            };
        });
    }

    // Single scroll handler: closes the mobile nav and toggles the
    // back-to-top button's visibility.
    window.addEventListener('scroll', () => {
        if (menu && navbar) {
            menu.classList.remove('fa-times');
            navbar.classList.remove('active');
            menu.setAttribute('aria-expanded', 'false');
        }

        const scrollTopBtn = document.querySelector('#scroll-top');
        if (scrollTopBtn) {
            if (window.scrollY > 60) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
        }
    });

    // Click/Tap toggle for hover curtains on Specialty & Menu cards (touch devices)
    const interactiveCards = document.querySelectorAll('.menu-card, .speciality .box-container .box');
    interactiveCards.forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            const isMenuCard = this.classList.contains('menu-card');
            const wasActive = this.classList.contains('active-touch');
            if (!isMenuCard && wasActive) return;

            interactiveCards.forEach(otherCard => { otherCard.classList.remove('active-touch'); });
            if (!wasActive) this.classList.add('active-touch');
        });
        card.addEventListener('mouseleave', function () { this.classList.remove('active-touch'); });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.menu-card') && !e.target.closest('.speciality .box-container .box')) {
            interactiveCards.forEach(card => { card.classList.remove('active-touch'); });
        }
    });

    // Floating/mobile section navigator: visible only while an actual menu
    // category (Starters, Veg Main Course, etc.) is in view - not merely
    // while the outer #popular section has started entering the viewport.
    const floatingNav = document.querySelector('.floating-menu-nav');
    const mobileNav = document.querySelector('.mobile-menu-nav');

    // Scroll-spy: highlight the nav link for whichever menu category is
    // currently in view, in both the desktop and mobile section navigators.
    const categorySections = document.querySelectorAll('.menu-category[id]');
    if (categorySections.length) {
        const navLinksByHref = {};
        document.querySelectorAll('.floating-menu-nav a, .mobile-menu-nav a').forEach(link => {
            const href = link.getAttribute('href');
            if (!navLinksByHref[href]) navLinksByHref[href] = [];
            navLinksByHref[href].push(link);
        });

        const setActiveCategory = (id) => {
            Object.values(navLinksByHref).flat().forEach(link => link.classList.remove('active'));
            const links = navLinksByHref['#' + id];
            if (links) links.forEach(link => link.classList.add('active'));
        };

        const visibleCategoryIds = new Set();

        const categoryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleCategoryIds.add(entry.target.id);
                    setActiveCategory(entry.target.id);
                } else {
                    visibleCategoryIds.delete(entry.target.id);
                }
            });

            const inMenu = visibleCategoryIds.size > 0;
            if (floatingNav) floatingNav.classList.toggle('visible', inMenu);
            if (mobileNav) mobileNav.classList.toggle('visible', inMenu);
        }, {
            root: null,
            threshold: 0,
            rootMargin: "-40% 0px -55% 0px"
        });

        categorySections.forEach(section => categoryObserver.observe(section));
    }
});
