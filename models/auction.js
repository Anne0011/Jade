var mongoose = require('mongoose');
var AuctionSchema = mongoose.Schema({

  endDate: Number,
  image: "http://brimages.bikeboardmedia.netdna-cdn.com/wp-content/uploads/2012/09/2013-Big-Wheel-Rally-High-Roller-Adult-Trike01.jpg",
  price: Number,
  seller: String,
  title: String,
  required: true
},
  }
});

var auction = mongoose.model('Auction', AuctionSchema);

module.exports = auction;
