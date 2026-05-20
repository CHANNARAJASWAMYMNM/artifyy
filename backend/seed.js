const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const SellerProfile = require('./models/SellerProfile');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/artify');
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany();
    await SellerProfile.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('Database cleared.');

    // 2. Create Users
    // Hash passwords manually for seeding if saving direct, or pre-create with user.save()
    // Let's define the users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Artify Administrator',
      email: 'admin@artify.com',
      password: 'password123', // hooks will trigger hash because we use create()
      role: 'admin',
    });

    const customerUser = await User.create({
      name: 'Rohan Sharma',
      email: 'customer@artify.com',
      password: 'password123',
      role: 'customer',
    });

    const seller1User = await User.create({
      name: 'Devi Prasad',
      email: 'devi@artify.com',
      password: 'password123',
      role: 'seller',
    });

    const seller2User = await User.create({
      name: 'Meera Devi',
      email: 'meera@artify.com',
      password: 'password123',
      role: 'seller',
    });

    console.log('Users seeded.');

    // 3. Create Seller Profiles (Auto-approved by default in seed)
    const profile1 = await SellerProfile.create({
      user: seller1User._id,
      shopName: 'Khurja Clay Treasures',
      story: 'I have been practicing pottery for over 35 years in Khurja, the pottery hub of Northern India. My father taught me how to feel the consistency of clay and create magic on the pottery wheel. Each terracotta and ceramic piece is hand-kneaded, hand-spun, and fired in our local community wood-fired kiln. By buying my crafts, you support a family of five and help keep a 400-year-old pottery legacy alive.',
      location: 'Khurja, Uttar Pradesh, India',
      craftType: 'Traditional Terracotta & Glazed Ceramics',
      avatar: 'https://images.unsplash.com/photo-1565192647048-f997ed8799d3?auto=format&fit=crop&w=200&q=80',
      banner: 'https://images.unsplash.com/photo-1595435934249-5df7ed864886?auto=format&fit=crop&w=1200&q=80',
      bankDetails: {
        accountHolder: 'Devi Prasad',
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
        upiId: 'deviprasad@oksbi',
      },
      status: 'approved',
    });

    const profile2 = await SellerProfile.create({
      user: seller2User._id,
      shopName: 'Jaipur Clay Sculptures & Decor',
      story: 'Welcome to Jaipur Crafts! I am Meera Devi, and I work with local women in Rajasthan to sculpt traditional clay figurines, home decor items, and painted wall hangings. We use clay harvested from local riverbeds and decorate them with organic colors, mirrors, and beads. Our shop brings the vibrant colors and rich rustic traditions of Rajasthan right into your modern home.',
      location: 'Jaipur, Rajasthan, India',
      craftType: 'Hand-painted Clay Figurines & Mirror Work',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      bankDetails: {
        accountHolder: 'Meera Devi',
        accountNumber: '987654321098',
        ifscCode: 'BARB0JAIPUR',
        upiId: 'meera@okbaroda',
      },
      status: 'approved',
    });

    console.log('Seller profiles seeded.');

    // 4. Create Products
    const p1 = await Product.create({
      seller: seller1User._id,
      name: 'Rustic Terracotta Glazed Serving Bowl',
      description: 'An elegant serving bowl made from natural terracotta clay. Features a beautiful half-glazed teal finish on the inside that makes it safe for hot soups and salads, while retaining the rustic matte clay feel on the outer surface.',
      story: 'This serving bowl is thrown on a traditional hand-turned kick wheel. After air-drying for 3 days, it is hand-painted with lead-free teal glass glaze and fired at 1100°C. The process yields unique circular patterns on every bowl, making each piece singular.',
      price: 650,
      category: 'Pottery',
      images: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'
      ],
      stock: 12,
    });

    const p2 = await Product.create({
      seller: seller1User._id,
      name: 'Earth-Toned Ceramic Coffee Mugs (Set of 2)',
      description: 'A set of two ergonomic coffee mugs glazed in a speckled beige and rich dark chocolate brown. Holds 350ml of your favorite beverage. Microwave and dishwasher safe.',
      story: 'We crafted these mugs to fit perfectly in the palm of your hand. The clay handles are pulled individually by hand and attached when the mugs are leather-hard, ensuring a sturdy and comfortable grip. The double-glaze reaction mimics mountain stone textures.',
      price: 480,
      category: 'Kitchenware',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
      ],
      stock: 25,
    });

    const p3 = await Product.create({
      seller: seller2User._id,
      name: 'Ganesha Clay Statue - Hand Painted',
      description: 'A meticulously hand-sculpted clay statue of Lord Ganesha, decorated with traditional Rajasthani mirror work and hand-painted with eco-friendly natural plant pigments.',
      story: 'During festive seasons, we work for weeks to prepare clay models. This Ganesha statue represents the spirit of new beginnings. It is dried in natural sunlight over 5 days, coated with white chalk, and then detailed with fine brushwork by local Rajasthani women artisans.',
      price: 1200,
      category: 'Clay Sculptures',
      images: [
        'https://images.unsplash.com/photo-1590076212953-cc729f127608?auto=format&fit=crop&w=600&q=80'
      ],
      stock: 5,
    });

    const p4 = await Product.create({
      seller: seller2User._id,
      name: 'Terracotta Floral Wall Hanging Plate',
      description: 'A decorative terracotta clay plate featuring intricate embossed floral carvings and small inlaid mirrors that capture and bounce light beautifully. Comes with a sturdy hemp hanging loop.',
      story: 'This wall plate uses the traditional block-carving style. We press a wooden block design onto raw clay, and then hand-carve the finer details. After firing, we paint it with vibrant red-ochre and attach glass mirror beads.',
      price: 850,
      category: 'Home Decor',
      images: [
        'https://images.unsplash.com/photo-1525974160448-037676e9efd3?auto=format&fit=crop&w=600&q=80'
      ],
      stock: 8,
    });

    const p5 = await Product.create({
      seller: seller1User._id,
      name: 'Handcrafted Terracotta Clay Earring Studs',
      description: 'Ultra-lightweight ceramic earring studs shaped like delicate lotus petals, glazed in a glossy terracotta orange. Hypoallergenic silver-plated backing.',
      story: 'Clay jewelry is extremely delicate to make. We slice thin pieces of terracotta clay, stamp them with organic textures, fire them in a miniature kiln, and use jewelry metal findings. Every set is incredibly lightweight and unique.',
      price: 320,
      category: 'Jewelry',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
      ],
      stock: 30,
    });

    console.log('Products seeded.');

    // 5. Create some reviews and update product ratings
    await Review.create({
      product: p1._id,
      customer: customerUser._id,
      customerName: customerUser.name,
      rating: 5,
      comment: 'Absolutely stunning! You can feel the texture of the clay and the internal glaze is waterproof and very easy to clean. Using it as a salad bowl and it is a highlight on our dining table. Highly recommend supporting Devi Prasad!',
    });

    await Review.create({
      product: p2._id,
      customer: customerUser._id,
      customerName: customerUser.name,
      rating: 4,
      comment: 'Super comfy mugs. They look very organic and keep the coffee hot. One mug had a tiny glaze spot on the handle, but it just adds to the handmade feel.',
    });

    console.log('Reviews seeded & average ratings updated.');

    // 6. Create a mock order to populate initial dashboards
    await Order.create({
      customer: customerUser._id,
      items: [
        {
          product: p1._id,
          name: p1.name,
          quantity: 1,
          price: p1.price,
          image: p1.images[0],
          seller: seller1User._id,
          status: 'processing',
        },
        {
          product: p3._id,
          name: p3.name,
          quantity: 1,
          price: p3.price,
          image: p3.images[0],
          seller: seller2User._id,
          status: 'shipped',
        }
      ],
      shippingAddress: {
        address: 'Flat 402, Sunshine Heights, MG Road',
        city: 'New Delhi',
        postalCode: '110001',
        country: 'India',
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      totalAmount: 1850, // 650 + 1200
    });

    console.log('Mock orders seeded.');
    console.log('🟢 Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`🔴 Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(seedData);
