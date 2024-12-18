const prices = [];
const itemsCounts = document.getElementById("checkout-items");
let isCouponActive = false;

document.querySelectorAll(".device-cost").forEach(item => {
    const priceText = item.textContent.trim().replace('$', '');
    const price = parseFloat(priceText);
    prices.push(price);
});

function parsePrice(value) {
    const number = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(number) ? 0 : number;
}


// function for animation
function animatePriceChange(element, fromValue, toValue, duration = 500) {
    if (!element || isNaN(fromValue) || isNaN(toValue)) return;

    const stepTime = 10;
    const steps = Math.ceil(duration / stepTime);
    const stepValue = (toValue - fromValue) / steps;

    let currentValue = fromValue;
    const interval = setInterval(() => {
        currentValue += stepValue;

        if ((stepValue > 0 && currentValue >= toValue) || (stepValue < 0 && currentValue <= toValue)) {
            currentValue = toValue;
            clearInterval(interval);
        }

        element.innerText = `$${currentValue.toFixed(2)}`;
    }, stepTime);
}


// function for update values
function updateValues(coupon) {
    const subTotalValue = prices.reduce((acc, cur) => acc + cur, 0);
    const taxValue = subTotalValue * 0.24;

    const subTotalHtml = document.getElementById("sub-total-value");
    const taxHtml = document.getElementById("tax-value");
    const totalHtml = document.getElementById("total-value");
    const couponHtml = document.getElementById("sale-value");

    itemsCounts.innerHTML = `${prices.length} ITEMS`;

    // Считаем новое значение для купона и тотала
    let newCouponValue = 0;
    let newTotalValue = subTotalValue + taxValue;

    if (coupon && prices.length > 0) {
        isCouponActive = true;
        newCouponValue = subTotalValue * 0.1;
        newTotalValue = subTotalValue + taxValue - newCouponValue;
    } else {
        isCouponActive = false;
    }

    // Получаем старые значения
    const oldSubTotal = parsePrice(subTotalHtml.innerText);
    const oldTax = parsePrice(taxHtml.innerText);
    const oldTotal = parsePrice(totalHtml.innerText);
    const oldCoupon = parsePrice(couponHtml.innerText);

    function prepareForAnimation(oldValue, newValue, element) {
        if (oldValue === newValue) {
            const slightlyDifferentValue = oldValue - 0.001;
            element.innerText = `$${slightlyDifferentValue.toFixed(2)}`;
            return slightlyDifferentValue;
        } else {
            element.innerText = `$${oldValue.toFixed(2)}`;
            return oldValue;
        }
    }

    const animFromSubTotal = prepareForAnimation(oldSubTotal, subTotalValue, subTotalHtml);
    const animFromTax = prepareForAnimation(oldTax, taxValue, taxHtml);
    const animFromCoupon = prepareForAnimation(oldCoupon, -newCouponValue, couponHtml);
    const animFromTotal = prepareForAnimation(oldTotal, newTotalValue, totalHtml);

    // Запускаем анимации
    animatePriceChange(subTotalHtml, animFromSubTotal, subTotalValue);
    animatePriceChange(taxHtml, animFromTax, taxValue);
    animatePriceChange(couponHtml, animFromCoupon, -newCouponValue);
    animatePriceChange(totalHtml, animFromTotal, newTotalValue);
}



updateValues(false);


// function for close
document.querySelector(".device-section").addEventListener("click", (event) => {
    const closeButton = event.target.closest(".close");
    if (closeButton) {
        const deviceInfo = closeButton.closest(".device-info");

        // Находим индекс элемента, который мы удаляем
        const deviceInfos = Array.from(document.querySelectorAll(".device-info"));
        const index = deviceInfos.indexOf(deviceInfo);

        // Исключаем товар из массива prices до начала анимации
        // Пересобираем цены заново, исключив текущий элемент
        const newPrices = [];
        deviceInfos.forEach((item, i) => {
            if (i !== index) {
                // Если это не удаляемый элемент, берем его цену
                const priceText = item.querySelector(".device-cost").textContent.trim().replace('$', '');
                const price = parseFloat(priceText);
                newPrices.push(price);
            }
        });

        prices.length = 0;
        prices.push(...newPrices);

        // Теперь обновляем значения до анимации исчезновения
        updateValues(isCouponActive);

        // Запускаем анимацию исчезновения
        deviceInfo.classList.add("removing");

        // Когда анимация завершится – удаляем элемент из DOM
        deviceInfo.addEventListener("transitionend", () => {
            deviceInfo.remove();
        }, { once: true });
    }
});


const correctCoupon = 1111;

// function for coupon
document.getElementById("coupon-submit-button").addEventListener("click", event => {
    const coupon = document.getElementById("coupon-input");
    if (coupon.value) {
        const couponValue = parseInt(coupon.value);
        if (couponValue === correctCoupon) {
            isCouponActive = true
            coupon.style.border = '2px solid limegreen';
            coupon.value = '';
            coupon.placeholder = "Your coupon is activated";
            coupon.classList.remove('red-placeholder');
            coupon.classList.add('green-placeholder');

            const couponAllHtml = document.querySelectorAll(".sale");
            couponAllHtml.forEach(item => {
                item.style.display = 'block';
            });

            updateValues(isCouponActive); // Купон активен
        } else {
            coupon.style.border = '2px solid red';
            coupon.value = '';
            coupon.placeholder = "This coupon is not valid";
            coupon.classList.add('red-placeholder');
        }
    } else {
        coupon.style.border = '2px solid red';
        coupon.value = '';
        coupon.placeholder = "You did not enter any coupon";
        coupon.classList.add('red-placeholder');
    }
});


// function for submit form
const form = document.getElementById("contact-form");

const inputs = [{
    element: document.getElementById("firstLast-name"),
    validate: (value) => value.trim() !== "",
    errorMessage: "Please enter valid name",
}, {
    element: document.getElementById("Email-address"),
    validate: (value) => /^\S+@\S+\.\S+$/.test(value),
    errorMessage: "Please enter valid email",
}, {
    element: document.getElementById("country-select"),
    validate: (value) => value.trim() !== "",
    errorMessage: "Choose your country",
}, {
    element: document.getElementById("postal-code"),
    validate: (value) => value.trim() !== "" && !isNaN(value),
    errorMessage: "Please enter valid post code",
}]

form.addEventListener("submit", (event) => {
    let isValid = true;

    inputs.forEach(({element, validate, errorMessage}) => {
        const value = element.value.trim();

        if (!validate(value)) {
            isValid = false;

            if (element.tagName === "SELECT") {
                const firstOption = element.querySelector("option:first-child");
                firstOption.innerHTML = errorMessage;
                firstOption.style.color = 'red'
                element.style.border = "2px solid red";
            } else {
                element.value = '';
                element.style.border = "2px solid red";
                element.placeholder = errorMessage;
                element.classList.add('red-placeholder');
            }
        } else {
            element.style.border = "";
            element.classList.remove('red-placeholder')
        }

        element.addEventListener("input", () => {
            if (element.value.trim() !== "" && validate(element.value)) {
                element.style.border = "";
                element.classList.remove('red-placeholder');
            }
        });
    });

    if (!isValid) {
        event.preventDefault();
    }
});
