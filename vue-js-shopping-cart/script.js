//@TODO NOTIFICATIONS

//---------
// Vue components
//---------
Vue.component('products', {
  
  ready: function () {
    var self = this;
    document.addEventListener("keydown", function(e) {
      if (self.showModal && e.keyCode == 37) {
        self.changeProductInModal("prev");
      } else if (self.showModal && e.keyCode == 39) {
        self.changeProductInModal("next");
      } else if (self.showModal && e.keyCode == 27) {
        self.hideModal();
      }
    }); 
  },

  template: "<h1>Products</h1>" + 
  "<div class='products'>" +
  "<div v-for='product in productsData' track-by='$index' class='product {{ product.product | lowercase }}'>" + 
  "<div class='image' @click='viewProduct(product)' v-bind:style='{ backgroundImage: \"url(\" + product.image + \")\" }' style='background-size: cover; background-position: center;'></div>" +
  "<div class='name'>{{ product.product }}</div>" +
  "<div class='description'>{{ product.description }}</div>" +
  "<div class='price'>{{ product.price | currency }}</div>" +
  "<button @click='addToCart(product)'>Add to Cart</button><br><br></div>" +
  "</div>" +
  "<div class='modalWrapper' v-show='showModal'>" +
  "<div class='prevProduct' @click='changeProductInModal(\"prev\")'><i class='fa fa-angle-left'></i></div>" +
  "<div class='nextProduct' @click='changeProductInModal(\"next\")'><i class='fa fa-angle-right'></i></div>" +
  "<div class='overlay' @click='hideModal()'></div>" + 
  "<div class='modal'>" + 
  "<i class='close fa fa-times' @click='hideModal()'></i>" + 
  "<div class='imageWrapper'><div class='image' v-bind:style='{ backgroundImage: \"url(\" + modalData.image + \")\" }' style='background-size: cover; background-position: center;' v-on:mouseover='imageMouseOver($event)' v-on:mousemove='imageMouseMove($event)' v-on:mouseout='imageMouseOut($event)'></div></div>" +
  "<div class='additionalImages' v-if='modalData.images'>" + 
  "<div v-for='image in modalData.images' class='additionalImage' v-bind:style='{ backgroundImage: \"url(\" + image.image + \")\" }' style='background-size: cover; background-position: center;' @click='changeImage(image.image)'></div>" +
  "</div>" +
  "<div class='name'>{{ modalData.product }}</div>" +
  "<div class='description'>{{ modalData.description }}</div>" +
  "<div class='details'>{{ modalData.details }}</div>" +
  "<h3 class='price'>{{ modalData.price | currency }}</h3>" +
  "<label for='modalAmount'>QTY</label>" +
  "<input id='modalAmount' value='{{ modalAmount }}' v-model='modalAmount' class='amount' @keyup.enter='modalAddToCart(modalData), hideModal()'/>" +
  "<button @click='modalAddToCart(modalData), hideModal()'>Add to Cart</button>" +
  "</div></div>",

  props: ['productsData', 'cart', 'tax', 'cartSubTotal', 'cartTotal'],

  data: function() {
    return {
      showModal: false,
      modalData: {},
      modalAmount: 1,
      timeout: "",
      mousestop: ""
    }
  },

  methods: {
    addToCart: function(product) {
      var found = false;

      for (var i = 0; i < vue.cart.length; i++) {

        if (vue.cart[i].sku === product.sku) {
          var newProduct = vue.cart[i];
          newProduct.quantity = newProduct.quantity + 1;
          vue.cart.$set(i, newProduct);
          //console.log("DUPLICATE",  vue.cart[i].product + "'s quantity is now: " + vue.cart[i].quantity);
          found = true;
          break;
        }
      }

      if(!found) {
        product.quantity = 1;
        vue.cart.push(product);
      }

      vue.cartSubTotal = vue.cartSubTotal + product.price;
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);
      vue.checkoutBool = true;
    },

    modalAddToCart: function(modalData) {
      var self = this;

      for(var i = 0; i < self.modalAmount; i++) {
        self.addToCart(modalData);
      }

      self.modalAmount = 1;
    },

    viewProduct: function(product) {      
      var self = this;
      //self.modalData = product;
      self.modalData = (JSON.parse(JSON.stringify(product)));
      self.showModal = true;
    },

    changeProductInModal: function(direction) {
      var self = this,
          productsLength = vue.productsData.length,
          currentProduct = self.modalData.sku,
          newProductId,
          newProduct;

      if(direction === "next") {
        newProductId = currentProduct + 1;

        if(currentProduct >= productsLength) {
          newProductId = 1;
        }

      } else if(direction === "prev") {
        newProductId = currentProduct - 1;

        if(newProductId === 0) {
          newProductId = productsLength;
        }
      }

      //console.log(direction, newProductId);

      for (var i = 0; i < productsLength; i++) {
        if (vue.productsData[i].sku === newProductId) {
          self.viewProduct(vue.productsData[i]);
        }
      }
    },

    hideModal: function() {
      //hide modal and empty modal data
      var self = this;
      self.modalData = {};
      self.showModal = false;
    },

    changeImage: function(image) {
      var self = this;
      self.modalData.image = image;
    },

    imageMouseOver: function(event) {
      event.target.style.transform = "scale(2)";
    },

    imageMouseMove: function(event) {
      var self = this;
      
      event.target.style.transform = "scale(2)";
      
      self.timeout = setTimeout(function() {
        event.target.style.transformOrigin = ((event.pageX - event.target.getBoundingClientRect().left) / event.target.getBoundingClientRect().width) * 100 + '% ' + ((event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset) / event.target.getBoundingClientRect().height) * 100 + "%";
      }, 50);
      
      self.mouseStop = setTimeout(function() {
        event.target.style.transformOrigin = ((event.pageX - event.target.getBoundingClientRect().left) / event.target.getBoundingClientRect().width) * 100 + '% ' + ((event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset) / event.target.getBoundingClientRect().height) * 100 + "%";
      }, 100);
    },

    imageMouseOut: function(event) {
      event.target.style.transform = "scale(1)";
    }
  }
});

Vue.component('cart', {
  template: '<div class="cart">' + 
  '<span class="cart-size" @click="showCart = !showCart"> {{ cart | cartSize }} </span><i class="fa fa-shopping-cart" @click="showCart = !showCart"></i>' +
  '<div class="cart-items" v-show="showCart">' +
  '<table class="cartTable">' +
  '<tbody>' +
  '<tr class="product" v-for="product in cart">' +
  '<td class="align-left"><div class="cartImage" @click="removeProduct(product)" v-bind:style="{ backgroundImage: \'url(\' + product.image + \')\' }" style="background-size: cover; background-position: center;"><i class="close fa fa-times"></i></div></td>' +
  '<td class="align-center"><button @click="quantityChange(product, \'decriment\')"><i class="close fa fa-minus"></i></button></td>' +
  '<td class="align-center">{{ cart[$index].quantity }}</td>' +
  '<td class="align-center"><button @click="quantityChange(product, \'incriment\')"><i class="close fa fa-plus"></i></button></td>' +
  '<td class="align-center">{{ cart[$index] | customPluralize }}</td>' +
  '<td>{{ product.price | currency }}</td>' +
  '</tbody>' +
  '<table>' +
  '</div>' +
  '<h4 class="cartSubTotal" v-show="showCart"> {{ cartSubTotal | currency }} </h4></div>' +
  '<button class="clearCart" v-show="checkoutBool" @click="clearCart()"> Clear Cart </button>' +
  '<button class="checkoutCart" v-show="checkoutBool" @click="propagateCheckout()"> Checkout </button>',

  props: ['checkoutBool', 'cart', 'cartSize', 'cartSubTotal', 'tax', 'cartTotal'],

  data: function() {
    return {
      showCart: false
    }
  },

  filters: {
    customPluralize: function(cart) {      
      var newName;

      if(cart.quantity > 1) {
        if(cart.product === "Peach") {
          newName = cart.product + "es";
        } else if(cart.product === "Puppy") {
          newName = cart.product + "ies";
          newName = newName.replace("y", "");
        } else {
          newName = cart.product + "s";
        }

        return newName;
      }

      return cart.product;
    },

    cartSize: function(cart) {
      var cartSize = 0;

      for (var i = 0; i < cart.length; i++) {
        cartSize += cart[i].quantity;
      }

      return cartSize;
    }
  },

  methods: {
    removeProduct: function(product) {
      vue.cart.$remove(product);
      vue.cartSubTotal = vue.cartSubTotal - (product.price * product.quantity);
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },

    clearCart: function() {
      vue.cart = [];
      vue.cartSubTotal = 0;
      vue.cartTotal = 0;
      vue.checkoutBool = false;
      this.showCart = false;
    },

    quantityChange: function(product, direction) {
      var qtyChange;

      for (var i = 0; i < vue.cart.length; i++) {
        if (vue.cart[i].sku === product.sku) {

          var newProduct = vue.cart[i];

          if(direction === "incriment") {
            newProduct.quantity = newProduct.quantity + 1;
            vue.cart.$set(i, newProduct);

          } else {
            newProduct.quantity = newProduct.quantity - 1;

            if(newProduct.quantity == 0) {
              vue.cart.$remove(newProduct);

            } else {
              vue.cart.$set(i, newProduct);
            }
          }
        }
      }

      if(direction === "incriment") {
        vue.cartSubTotal = vue.cartSubTotal + product.price;

      } else {
        vue.cartSubTotal = vue.cartSubTotal - product.price;
      }

      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },
    //send our request up the chain, to our parent
    //our parent catches the event, and sends the request back down
    propagateCheckout: function() {
      vue.$dispatch("checkoutRequest");
    }
  }
});

Vue.component('checkout-area', {
  template: "<h1>Checkout Area</h1>" + 
  '<div class="checkout-area">' + 
  '<span> {{ cart | cartSize }} </span><i class="fa fa-shopping-cart"></i>' +
  '<table>' +
  '<thead>' +
  '<tr>' +
  '<th class="align-center">SKU</th>' +
  '<th>Name</th>' +
  '<th>Description</th>' +
  '<th class="align-right">Amount</th>' +
  '<th class="align-right">Price</th>' +
  '</tr>' +
  '</thead>' +
  '<tbody>' +
  '<tr v-for="product in cart" track-by="$index">' +
  '<td class="align-center">{{ product.sku }}</td>' +
  '<td>{{ product.product }}</td>' +
  '<td>{{ product.description }}</td>' +
  '<td class="align-right">{{ cart[$index].quantity }}</td>' +
  '<td class="align-right">{{ product.price | currency }}</td>' +
  '</tr>' +
  //'<button @click="removeProduct(product)"> X </button></div>' +
  '<tr>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right">Subtotal:</td>' +
  '<td class="align-right"><h4 v-if="cartSubTotal != 0"> {{ cartSubTotal | currency }} </h4></td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right">Tax:</td>' +
  '<td class="align-right"><h4 v-if="cartSubTotal != 0"> {{ cartTotal - cartSubTotal | currency }} </h4></td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right vert-bottom">Total:</td>' +
  '<td class="align-right vert-bottom"><h2 v-if="cartSubTotal != 0"> {{ cartTotal | currency }} </h2></td>' +
  '</tr>' +
  '</tbody>' +
  '</table>' +
  '<button v-show="cartSubTotal" @click="checkoutModal()">Checkout</button></div>' + 
  "<div class='modalWrapper' v-show='showModal'>" +
  "<div class='overlay' @click='hideModal()'></div>" + 
  "<div class='modal checkout'>" + 
  "<i class='close fa fa-times' @click='hideModal()'></i>" + 
  "<h1>Checkout</h1>" +
  "<div>We accept: <i class='fa fa-stripe'></i> <i class='fa fa-cc-visa'></i> <i class='fa fa-cc-mastercard'></i> <i class='fa fa-cc-amex'></i> <i class='fa fa-cc-discover'></i></div><br>" +
  "<h3> Subtotal: {{ cartSubTotal | currency }} </h3>" +
  "<h3> Tax: {{ cartTotal - cartSubTotal | currency }} </h4>" +
  "<h1> Total: {{ cartTotal | currency }} </h3>" +
  "<br><div>This is where our payment processor goes</div>" +
   "<br><div><b>Name</b> <input/ style='border-top-style:none;border-right-style:none;border-left-style:none'><b>Phone</b> <input/ style='border-top-style:none;border-right-style:none;border-left-style:none'></div>" +
  "</div>",

  props: ['cart', 'cartSize', 'cartSubTotal', 'tax', 'cartTotal'],

  data: function() {
    return {
      showModal: false
    }
  },

  filters: {
    customPluralize: function(cart) {      
      var newName;

      if(cart.quantity > 1) {
        newName = cart.product + "s";
        return newName;
      }

      return cart.product;
    },

    cartSize: function(cart) {
      var cartSize = 0;

      for (var i = 0; i < cart.length; i++) {
        cartSize += cart[i].quantity;
      }

      return cartSize;
    }
  },

  methods: {
    removeProduct: function(product) {
      vue.cart.$remove(product);
      vue.cartSubTotal = vue.cartSubTotal - (product.price * product.quantity);
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },

    checkoutModal: function() {
      var self = this;
      self.showModal = true;

      console.log("CHECKOUT", self.cartTotal);

    },

    hideModal: function() {
      //hide modal and empty modal data
      var self = this;
      self.showModal = false;
    }
  },
  
  //intercept the checkout request broadcast
  //run our function
  events: {
    "checkoutRequest": function() {
      var self = this;
      self.checkoutModal();
    }
  }
});

//---------
// Vue init
//---------
Vue.config.debug = false;
var vue = new Vue({
  el: "#vue",

  data: {
    productsData: [
      {
        sku: 1,
        product: "Subject: Introductory Technology",
        image: "https://images.theconversation.com/files/274417/original/file-20190514-60529-ktb5t3.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=1200.0&fit=crop",
       
        description: "Location: Lagos",
        
        price: 1000
      },

      {
        sku: 2,
        product: "Subject: English",
        image: "https://uconsulting.nl/wp-content/uploads/English-flow-1.jpg",
        description: "Location: Imo",
        
        price: 500
      },

      {
        sku: 3,
        product: "Subject: Literature",
        image: "https://highschool.latimes.com/wp-content/uploads/2019/02/classic-lit-.jpg",
        description: "Location: Abuja",
       
        price: 300
      },

      {
        sku: 4,
        product: "Subject: Business Intelligence",
        image: "https://blog.bismart.com/hubfs/Imported_Blog_Media/Business%20Intelligence%20c%C3%B3mo%20plantear%20un%20proyecto/20190607-BusinessIntelligence_portada.jpg",
        description: "Location: Malta",
        price: 800
      },

      {
        sku: 5,
        product: "Subject: Social Studies",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Social_Studies_MPS_FINAL.png",
        description: "Location: Isreal",
        price: 400
      },

      {
        sku: 6,
        product: "Subject: Physics",
        image: "https://images.theconversation.com/files/191827/original/file-20171025-25516-g7rtyl.jpg?ixlib=rb-1.1.0&rect=0%2C70%2C7875%2C5667&q=45&auto=format&w=926&fit=clip",
        description: "Location: Athens",
        price: 1000
      },

      {
        sku: 7,
        product: "Subject: Computer Science",
        image: "https://wp-media.petersons.com/blog/wp-content/uploads/2018/01/26100309/blur-close-up-code-computer-546819.jpg",
        description: "Location: Santorini",
        price: 700
      },

      {
        sku: 8,
        product: "Subject: Civil Education",
        image: "https://thumbs.dreamstime.com/b/educational-concept-civic-education-phrase-piece-paper-184303219.jpg",
        description: "Location: India",
        price: 900
      },

      {
        sku: 9,
        product: "Subject: Sex Education",
        image: "https://images.theconversation.com/files/122116/original/image-20160511-18140-1bruo3q.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=926&fit=clip",
        description: "Location: Sair Lanka",
        price: 450
      },

      {
        sku: 10,
        product: "Subject: Music",
        image: "https://image.freepik.com/free-vector/elegant-musical-notes-music-chord-background_1017-20759.jpg",
        description: "Location: Peru",
        price: 500.70
      }
    ],
    checkoutBool: false,
    cart: [],
    cartSubTotal: 0,
    tax: 0.45,
    cartTotal: 0
  },
  
  //intercept the checkout request dispatch
  //send it back down the chain
  events: {
    "checkoutRequest": function() {
      vue.$broadcast("checkoutRequest");
    }
  }
});