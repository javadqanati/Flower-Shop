function shoppingCardHTML(p) {
    return `
        <div class="shopping-card" data-id="${p.id}">

            <div class="image-sec">
                <img src="${p.image_url}">
                ${p.is_featured ? `<span class="hot-offer">Hot offer!</span>` : ``}
            </div>

            <div class="title">${p.name}</div>

            <div class="buttons">
                <div class="right">
                    <span class="price">${p.price}€</span>
                </div>
                <div class="left">
                    <div class="extend-btn">
                        <a class="b-text" href="#">Wish list</a>
                        <a class="b-icon"><i class="fa-regular fa-heart"></i></a>
                    </div>
                    <div class="extend-btn">
                        <a class="b-text" href="#">add to cart</a>
                        <a class="b-icon"><i class="fa-solid fa-bag-shopping"></i></a>
                    </div>
                </div>
            </div>
        </div>
    `;
}
