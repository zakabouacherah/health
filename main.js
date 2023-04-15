// Variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.product-center');
const menu = document.querySelector('.menu');
const menuBtn = document.querySelector('.menu-icon');
const closeMenuBtn = document.querySelector('.close-menu');

let cart = [] ;
let buttonsDOM = [] ;

menuBtn.addEventListener('click',()=>{
  menu.classList.add('showMenu');
  cartOverlay.classList.add('transparentBcg');
});
closeMenuBtn.addEventListener('click',()=>{
  menu.classList.remove('showMenu');
  cartOverlay.classList.remove('transparentBcg');
});

function readMore() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("myBtn");
  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more"; 
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less"; 
    moreText.style.display = "inline";
  }
}


// getting products
class Products { 
  async getProducts(){
    try {
      let result = await fetch("meals.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item =>{
        const {title,price,eValue} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title,price,eValue,id,image}
      })
      return products
    } catch (error) {
      console.log(error);
    }
  }
}
// display products
class UI {
  displayProducts(products){
    let result = '';
    products.forEach(product => {
      result +=`
      <article class="product">
        <div class="img-container">
          <img src=${product.image} alt="meal 1" class="product-img">
          <button class="bag-btn" data-id=${product.id}>
            <span class="material-symbols-outlined add-to-bag">add_shopping_cart</span>
            Add to cart
          </button>
          <div class="product-details">
            <h3>La valeur énergétique : </h3>
            <ul>
              <li>Ton repas a :<strong> ${product.eValue} kilocalories </strong></li>
            </ul>
          </div>
        </div>
        <h3>${product.title}</h3>
        <h4>${product.price} DH</h4>
      </article>`;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons(){
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons
    buttons.forEach(button =>{
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart){
        button.innerHTML = `
        <span class="material-symbols-outlined">
          shopping_cart_checkout
        </span>
        Already in cart`;
        button.disabled = true;
      }
      button.addEventListener('click',(event)=>{
        event.target.innerHTML = `
        <span class="material-symbols-outlined">
          shopping_cart_checkout
        </span>
        Already in cart`;
        event.target.disabled = true;
        // get product from products
        let cartItem ={ ...Storage.getProduct(id), amount:1};
        // add product to cart
        cart = [...cart,cartItem];
        // save cart array in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart){
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item =>{
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src="${item.image}" alt="meal 1">
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price} DH</h5>
      <span class="material-symbols-outlined remove-item" data-id=${item.id}>delete</span>
    </div>
    <div class="quantity">
      <span class="material-symbols-outlined up" data-id=${item.id}>
        arrow_drop_up
      </span>
      <p class="item-amount">${item.amount}</p>
      <span class="material-symbols-outlined down" data-id=${item.id}>
        arrow_drop_down
      </span>
    </div>
    `;
    cartContent.appendChild(div);
  }
  showCart(){
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  setupApp(){
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click',this.showCart);
    closeCartBtn.addEventListener('click',this.hideCart)
  }
  populateCart(cart){
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart(){
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic(){
    clearCartBtn.addEventListener('click', () =>{
      this.clearCart();
    });
    cartContent.addEventListener('click' , event =>{
      if (event.target.classList.contains('remove-item')){
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }else if(event.target.classList.contains('up')){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('down')){
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0){
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }

      }
    });
  }
  clearCart(){
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while(cartContent.children.length>0){
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id){
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <span class="material-symbols-outlined add-to-bag">
      add_shopping_cart
    </span>Add to cart`;
  }
  getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id);
  }

}
// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id){
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart){
    localStorage.setItem('cart',JSON.stringify(cart));
  }
  static getCart(){
    return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const ui = new UI();
  const products = new Products();

  ui.setupApp();
  products.getProducts().then(products =>{
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });
});