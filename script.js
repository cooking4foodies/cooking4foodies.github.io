// Item prices mapping lookup mapped to Menu Card
const itemPrices = {
    "Beguni (4 Pcs)": 99,
    "Paneer Pakoda (8 Pcs)": 299,
    "Chicken Pakoda with Green Chutney (8 Pcs)": 299,
    "Masala Fish Fry (2 Pcs)": 249,
    "Machh Bhaja - Plain Fish Fry (2 Pcs)": 199,
    "Egg Omelette (2 Eggs)": 99,
    "Dhokar Dalna (4 Pcs)": 249,
    "Phulkopi Alur Torkari - Serves 2": 249,
    "Alu Posto - Serves 2": 249,
    "Potol Alur Torkari - Serves 2": 249,
    "Potol Posto - Serves 2": 249,
    "Lau Ghonto - Serves 2": 199,
    "Dahi Baigana Odia Food - Serves 2": 199,
    "Mooger Dal Bengali Style - Serves 2": 199,
    "Chholar Dal Bengali Style - Serves 2": 199,
    "Tel Potol - Serves 2": 199,
    "Alur Dom (6 Pcs)": 149,
    "Alu Bhaja - Serves 2": 99,
    "Potol Bhaja - Serves 2": 99,
    "Chicken Kosha - Spicy Chicken Curry (4 Pcs)": 249,
    "Chicken Jhol - Bengali Chicken Curry (4 Pcs)": 249,
    "Machher Kalia - Bengali Fish Delicacy (2 Pcs)": 249,
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

function handleOrderSubmit(event) {
    event.preventDefault();
    const formInputs = document.querySelectorAll('#orderForm input, #orderForm textarea');
    const name = formInputs[0].value;
    const email = formInputs[1].value;
    const contact = formInputs[2].value;
    const address = formInputs[3].value;

    const rows = document.getElementsByClassName('item-row');
    let orderedItemsList = [];
    for (let row of rows) {
        const select = row.querySelector('select');
        const qtyInput = row.querySelector('.qty-box input');
        if (select.value && parseInt(qtyInput.value) > 0) {
            orderedItemsList.push(select.value + " (Qty: " + qtyInput.value + ")");
        }
    }

    const totalAmount = document.getElementById('total-amount').innerText;

    const orderData = {
        name: name, email: email, contact: contact, address: address,
        items: orderedItemsList.join(', '), totalAmount: totalAmount
    };

    const scriptURL = 'https://script.google.com/macros/s/AKfycby1pOgDOYrL_GqkHe24cJWnjMf_9eWlvGo-ROYJhI55jupQjH96M90KGl_HWqrOkddzeA/exec';

    fetch(scriptURL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
        .then(() => {
            document.getElementById('successModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('There was an error submitting your order. Please try again.');
        });
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('orderForm').reset();
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

    // Intersection Observer to show/hide floating menu only while scrolling through #popular
    const menuSection = document.getElementById('popular');
    const floatingNav = document.querySelector('.floating-menu-nav');
    const mobileNav = document.querySelector('.mobile-menu-nav');

    if (menuSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (floatingNav) floatingNav.classList.add('visible');
                    if (mobileNav) mobileNav.classList.add('visible');
                } else {
                    if (floatingNav) floatingNav.classList.remove('visible');
                    if (mobileNav) mobileNav.classList.remove('visible');
                }
            });
        }, {
            root: null,
            threshold: 0.02,
            rootMargin: "0px 0px -20% 0px"
        });

        observer.observe(menuSection);
    }
});
